import { z } from "zod";

import { CategoryModel, PasswordEntryModel } from "../../db";
import { recordAudit } from "../../http/audit";
import { apiError, notFound } from "../../http/errors";
import { factory } from "../../http/factory";
import { readBody, readQuery } from "../../http/request";
import { objectIdSchema } from "../../http/schemas";
import { toCategory } from "../../http/serializers";
import { requireSession } from "../../http/session";

const nameSchema = z.string().trim().min(1).max(50);
const iconSchema = z.string().min(1).max(10);
const colorSchema = z.string().regex(/^#[\dA-Fa-f]{6}$/);

const readCategoryId = (id: string) => {
	const result = objectIdSchema.safeParse(id);

	if (!result.success) {
		throw notFound("Category not found");
	}

	return result.data;
};

const findEditableCategory = async ({
	id,
	userId,
}: {
	id: string;
	userId: string;
}) => {
	const category = await CategoryModel.findOne({ _id: id, userId }).lean();

	if (!category) {
		throw notFound("Category not found");
	}

	if (category.isLocked) {
		throw apiError({
			status: 403,
			code: "LOCKED",
			message: "This category cannot be changed",
		});
	}

	return category;
};

const categoryRoutes = factory
	.createApp()
	.use(requireSession)
	.post("/", async (context) => {
		const { name, icon, color } = await readBody({
			context,
			schema: z.object({
				name: nameSchema,
				icon: iconSchema.default("📁"),
				color: colorSchema.default("#6B7280"),
			}),
		});
		const { userId } = context.var.auth;
		const lastCategory = await CategoryModel.findOne({ userId })
			.sort({ order: -1 })
			.select("order")
			.lean();
		const category = await CategoryModel.create({
			userId,
			name,
			icon,
			color,
			order: (lastCategory?.order ?? -1) + 1,
		});

		return context.json({ category: toCategory(category) }, 201);
	})
	.put("/:id", async (context) => {
		const id = readCategoryId(context.req.param("id"));
		const updates = await readBody({
			context,
			schema: z.object({
				name: nameSchema.optional(),
				icon: iconSchema.optional(),
				color: colorSchema.optional(),
				order: z.int().min(0).optional(),
			}),
		});
		const { userId } = context.var.auth;

		await findEditableCategory({ id, userId });

		const category = await CategoryModel.findOneAndUpdate(
			{ _id: id, userId },
			{ $set: updates },
			{ returnDocument: "after" },
		).lean();

		if (!category) {
			throw notFound("Category not found");
		}

		return context.json({ category: toCategory(category) });
	})
	.delete("/:id", async (context) => {
		const id = readCategoryId(context.req.param("id"));
		const { moveTo } = readQuery({
			context,
			schema: z.object({ moveTo: objectIdSchema.optional() }),
		});
		const { userId } = context.var.auth;
		const category = await findEditableCategory({ id, userId });

		if (category.isDefault) {
			throw apiError({
				status: 403,
				code: "LOCKED",
				message: "Default categories cannot be deleted",
			});
		}

		if (
			moveTo &&
			(moveTo === id ||
				!(await CategoryModel.exists({ _id: moveTo, userId })))
		) {
			throw apiError({
				status: 400,
				code: "INVALID_CATEGORY",
				message: "Target category not found",
			});
		}

		await PasswordEntryModel.updateMany(
			{ userId, categoryId: id },
			moveTo ? { categoryId: moveTo } : { $unset: { categoryId: "" } },
		);
		await CategoryModel.deleteOne({ _id: id, userId });
		await recordAudit({
			context,
			userId,
			action: "category_deleted",
			resourceType: "category",
			resourceId: id,
		});

		return context.body(null, 204);
	});

export { categoryRoutes };
