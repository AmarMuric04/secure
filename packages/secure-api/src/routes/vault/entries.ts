import { z } from "zod";

import { CategoryModel, PasswordEntryModel } from "../../db";
import { recordAudit } from "../../http/audit";
import { apiError, notFound } from "../../http/errors";
import { factory } from "../../http/factory";
import { readBody, readQuery } from "../../http/request";
import {
	breachFlagBodySchema,
	bulkPasswordEntriesBodySchema,
	objectIdSchema,
	passwordEntryBodySchema,
	passwordEntryUpdateBodySchema,
} from "../../http/schemas";
import { toCategory, toPasswordEntry } from "../../http/serializers";
import { requireSession } from "../../http/session";

const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;

const purgeExpiredTrash = (userId: string) =>
	PasswordEntryModel.deleteMany({
		userId,
		deletedAt: { $lt: new Date(Date.now() - TRASH_RETENTION_MS) },
	});

const assertOwnedCategory = async ({
	userId,
	categoryId,
}: {
	userId: string;
	categoryId: string | null;
}) => {
	if (
		categoryId &&
		!(await CategoryModel.exists({ _id: categoryId, userId }))
	) {
		throw apiError({
			status: 400,
			code: "INVALID_CATEGORY",
			message: "Category not found",
		});
	}
};

const readEntryId = (id: string) => {
	const result = objectIdSchema.safeParse(id);

	if (!result.success) {
		throw notFound("Password entry not found");
	}

	return result.data;
};

const entryRoutes = factory
	.createApp()
	.use(requireSession)
	.get("/", async (context) => {
		const { includeDeleted } = readQuery({
			context,
			schema: z.object({
				includeDeleted: z.enum(["true", "false"]).optional(),
			}),
		});
		const { userId } = context.var.auth;

		await purgeExpiredTrash(userId);

		const [entries, categories] = await Promise.all([
			PasswordEntryModel.find(
				includeDeleted === "true"
					? { userId }
					: { userId, deletedAt: null },
			)
				.sort({ updatedAt: -1 })
				.lean(),
			CategoryModel.find({ userId }).sort({ order: 1 }).lean(),
		]);

		return context.json({
			passwords: entries.map(toPasswordEntry),
			categories: categories.map(toCategory),
		});
	})
	.post("/passwords/bulk", async (context) => {
		const { entries } = await readBody({
			context,
			schema: bulkPasswordEntriesBodySchema,
		});
		const { userId } = context.var.auth;
		const categoryIds = entries
			.map((entry) => entry.metadata.categoryId)
			.filter(
				(categoryId, index, all): categoryId is string =>
					!!categoryId && all.indexOf(categoryId) === index,
			);
		const ownedCount = await CategoryModel.countDocuments({
			_id: { $in: categoryIds },
			userId,
		});

		if (ownedCount !== categoryIds.length) {
			throw apiError({
				status: 400,
				code: "INVALID_CATEGORY",
				message: "Category not found",
			});
		}

		const now = new Date();
		const created = await PasswordEntryModel.insertMany(
			entries.map(({ encryptedData, iv, metadata }) => ({
				...metadata,
				categoryId: metadata.categoryId ?? undefined,
				userId,
				encryptedData,
				iv,
				passwordChangedAt: now,
			})),
		);

		await recordAudit({
			context,
			userId,
			action: "password_created",
			resourceType: "password",
			metadata: { count: created.length, source: "import" },
		});

		return context.json({ createdCount: created.length }, 201);
	})
	.post("/passwords", async (context) => {
		const { encryptedData, iv, metadata } = await readBody({
			context,
			schema: passwordEntryBodySchema,
		});
		const { userId } = context.var.auth;

		await assertOwnedCategory({ userId, categoryId: metadata.categoryId });

		const entry = await PasswordEntryModel.create({
			...metadata,
			categoryId: metadata.categoryId ?? undefined,
			userId,
			encryptedData,
			iv,
			passwordChangedAt: new Date(),
		});

		await recordAudit({
			context,
			userId,
			action: "password_created",
			resourceType: "password",
			resourceId: entry._id.toString(),
		});

		return context.json({ password: toPasswordEntry(entry) }, 201);
	})
	.put("/passwords/:id", async (context) => {
		const id = readEntryId(context.req.param("id"));
		const { encryptedData, iv, metadata, isPasswordChanged } =
			await readBody({
				context,
				schema: passwordEntryUpdateBodySchema,
			});
		const { userId } = context.var.auth;

		await assertOwnedCategory({ userId, categoryId: metadata.categoryId });

		const { categoryId, ...entryMetadata } = metadata;
		const entry = await PasswordEntryModel.findOneAndUpdate(
			{ _id: id, userId, deletedAt: null },
			{
				$set: {
					...entryMetadata,
					encryptedData,
					iv,
					...(categoryId ? { categoryId } : {}),
					...(isPasswordChanged
						? { passwordChangedAt: new Date() }
						: {}),
				},
				...(categoryId ? {} : { $unset: { categoryId: "" } }),
			},
			{ returnDocument: "after" },
		).lean();

		if (!entry) {
			throw notFound("Password entry not found");
		}

		await recordAudit({
			context,
			userId,
			action: "password_updated",
			resourceType: "password",
			resourceId: id,
		});

		return context.json({ password: toPasswordEntry(entry) });
	})
	.delete("/passwords/:id", async (context) => {
		const id = readEntryId(context.req.param("id"));
		const { permanent } = readQuery({
			context,
			schema: z.object({
				permanent: z.enum(["true", "false"]).optional(),
			}),
		});
		const { userId } = context.var.auth;
		const isPermanent = permanent === "true";
		const { matchedCount } = isPermanent
			? await PasswordEntryModel.deleteOne({ _id: id, userId }).then(
					({ deletedCount }) => ({ matchedCount: deletedCount }),
				)
			: await PasswordEntryModel.updateOne(
					{ _id: id, userId, deletedAt: null },
					{ deletedAt: new Date() },
				);

		if (matchedCount === 0) {
			throw notFound("Password entry not found");
		}

		await recordAudit({
			context,
			userId,
			action: "password_deleted",
			resourceType: "password",
			resourceId: id,
			metadata: { permanent: isPermanent },
		});

		return context.body(null, 204);
	})
	.patch("/passwords/:id/breach", async (context) => {
		const id = readEntryId(context.req.param("id"));
		const { isCompromised } = await readBody({
			context,
			schema: breachFlagBodySchema,
		});
		const { userId } = context.var.auth;
		const { matchedCount } = await PasswordEntryModel.updateOne(
			{ _id: id, userId },
			{ $set: { isCompromised } },
			{ timestamps: false },
		);

		if (matchedCount === 0) {
			throw notFound("Password entry not found");
		}

		return context.body(null, 204);
	})
	.patch("/passwords/:id/used", async (context) => {
		const id = readEntryId(context.req.param("id"));
		const { userId } = context.var.auth;
		const { matchedCount } = await PasswordEntryModel.updateOne(
			{ _id: id, userId, deletedAt: null },
			{ $set: { lastUsedAt: new Date() } },
			{ timestamps: false },
		);

		if (matchedCount === 0) {
			throw notFound("Password entry not found");
		}

		return context.body(null, 204);
	})
	.post("/passwords/:id/restore", async (context) => {
		const id = readEntryId(context.req.param("id"));
		const { userId } = context.var.auth;
		const entry = await PasswordEntryModel.findOneAndUpdate(
			{ _id: id, userId, deletedAt: { $ne: null } },
			{ $unset: { deletedAt: "" } },
			{ returnDocument: "after" },
		).lean();

		if (!entry) {
			throw notFound("Password entry not found in trash");
		}

		await recordAudit({
			context,
			userId,
			action: "password_restored",
			resourceType: "password",
			resourceId: id,
		});

		return context.json({ password: toPasswordEntry(entry) });
	});

export { entryRoutes };
