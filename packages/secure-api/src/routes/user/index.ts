import { z } from "zod";

import {
	AuditLogModel,
	CategoryModel,
	PasswordEntryModel,
	UserModel,
} from "../../db";
import { recordAudit } from "../../http/audit";
import { apiError, invalidCredentials, notFound } from "../../http/errors";
import { factory } from "../../http/factory";
import { enforceRateLimit, readBody } from "../../http/request";
import {
	authHashSchema,
	settingsSchema,
	totpCodeSchema,
} from "../../http/schemas";
import { toPublicUser } from "../../http/serializers";
import { endAllSessions, endSession, requireSession } from "../../http/session";
import { hashSecret, verifySecret } from "../../security/secrets";
import {
	createOtpauthUrl,
	createTotpSecret,
	findTotpStep,
	isValidTotpSecret,
} from "../../security/totp";
import { createHexCode } from "../../security/tokens";
import { verifySecondFactor } from "../auth";

const BACKUP_CODE_COUNT = 10;

const reauthenticate = async ({
	userId,
	authHash,
}: {
	userId: string;
	authHash: string;
}) => {
	await enforceRateLimit({ limit: "reauthenticateByUser", subject: userId });

	const user = await UserModel.findById(userId);

	if (
		!user ||
		!(await verifySecret({ secret: authHash, secretHash: user.authHash }))
	) {
		throw invalidCredentials();
	}

	return user;
};

const userRoutes = factory
	.createApp()
	.use(requireSession)
	.get("/profile", async (context) => {
		const user = await UserModel.findById(context.var.auth.userId).lean();

		if (!user) {
			throw notFound("User not found");
		}

		return context.json({ user: toPublicUser(user) });
	})
	.put("/profile", async (context) => {
		const { name, settings } = await readBody({
			context,
			schema: z.object({
				name: z.string().trim().min(2).max(100).optional(),
				settings: settingsSchema.optional(),
			}),
		});
		const { userId } = context.var.auth;
		const settingUpdates = Object.fromEntries(
			Object.entries(settings ?? {}).map(([key, value]) => [
				`settings.${key}`,
				value,
			]),
		);
		const user = await UserModel.findByIdAndUpdate(
			userId,
			{ $set: { ...(name ? { name } : {}), ...settingUpdates } },
			{ returnDocument: "after" },
		).lean();

		if (!user) {
			throw notFound("User not found");
		}

		if (settings) {
			await recordAudit({
				context,
				userId,
				action: "settings_changed",
				resourceType: "user",
				resourceId: userId,
				metadata: { changedFields: Object.keys(settings) },
			});
		}

		return context.json({ user: toPublicUser(user) });
	})
	.delete("/profile", async (context) => {
		const { authHash } = await readBody({
			context,
			schema: z.object({ authHash: authHashSchema }),
		});
		const { userId } = context.var.auth;

		await reauthenticate({ userId, authHash });
		await Promise.all([
			PasswordEntryModel.deleteMany({ userId }),
			CategoryModel.deleteMany({ userId }),
			AuditLogModel.deleteMany({ userId }),
		]);
		await endSession(context);
		await endAllSessions(userId);
		await UserModel.deleteOne({ _id: userId });
		await recordAudit({
			context,
			userId,
			action: "account_deleted",
			resourceType: "user",
			resourceId: userId,
		});

		return context.body(null, 204);
	})
	.get("/mfa", async (context) => {
		const user = await UserModel.findById(context.var.auth.userId)
			.select("email mfaEnabled")
			.lean();

		if (!user) {
			throw notFound("User not found");
		}

		if (user.mfaEnabled) {
			throw apiError({
				status: 409,
				code: "ALREADY_ENABLED",
				message: "Two-factor authentication is already enabled",
			});
		}

		const secret = createTotpSecret();

		return context.json({
			secret,
			otpauthUrl: createOtpauthUrl({ secret, email: user.email }),
		});
	})
	.post("/mfa", async (context) => {
		const { secret, code } = await readBody({
			context,
			schema: z.object({
				secret: z.string().refine(isValidTotpSecret),
				code: totpCodeSchema,
			}),
		});
		const { userId } = context.var.auth;
		const step = findTotpStep({ secret, code, lastUsedStep: 0 });

		if (step === null) {
			throw apiError({
				status: 400,
				code: "INVALID_CODE",
				message: "Invalid verification code",
			});
		}

		const backupCodes = Array.from({ length: BACKUP_CODE_COUNT }, () =>
			createHexCode(5),
		);
		const { modifiedCount } = await UserModel.updateOne(
			{ _id: userId, mfaEnabled: { $ne: true } },
			{
				mfaEnabled: true,
				mfaSecret: secret,
				mfaLastUsedStep: step,
				mfaBackupCodes: await Promise.all(backupCodes.map(hashSecret)),
			},
		);

		if (modifiedCount !== 1) {
			throw apiError({
				status: 409,
				code: "ALREADY_ENABLED",
				message: "Two-factor authentication is already enabled",
			});
		}

		await recordAudit({
			context,
			userId,
			action: "mfa_enabled",
			resourceType: "user",
			resourceId: userId,
		});

		return context.json({ backupCodes });
	})
	.delete("/mfa", async (context) => {
		const { authHash, code } = await readBody({
			context,
			schema: z.object({
				authHash: authHashSchema,
				code: totpCodeSchema,
			}),
		});
		const { userId } = context.var.auth;
		const user = await reauthenticate({ userId, authHash });

		if (
			!user.mfaEnabled ||
			!(await verifySecondFactor({ user, method: "totp", code }))
		) {
			throw apiError({
				status: 400,
				code: "INVALID_CODE",
				message: "Invalid verification code",
			});
		}

		await UserModel.updateOne(
			{ _id: userId },
			{
				mfaEnabled: false,
				$unset: { mfaSecret: "" },
				mfaBackupCodes: [],
				mfaLastUsedStep: 0,
			},
		);
		await recordAudit({
			context,
			userId,
			action: "mfa_disabled",
			resourceType: "user",
			resourceId: userId,
		});

		return context.json({
			user: toPublicUser({ ...user.toObject(), mfaEnabled: false }),
		});
	});

export { userRoutes };
