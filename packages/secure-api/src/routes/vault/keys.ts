import { z } from "zod";

import { AuthSessionModel, UserModel } from "../../db";
import { recordAudit } from "../../http/audit";
import { apiError, invalidCredentials, notFound } from "../../http/errors";
import { factory } from "../../http/factory";
import { enforceRateLimit, readBody } from "../../http/request";
import {
	authHashSchema,
	encryptedVaultKeySchema,
	saltSchema,
} from "../../http/schemas";
import { requireSession } from "../../http/session";
import { hashSecret, verifySecret } from "../../security/secrets";

const keyRoutes = factory
	.createApp()
	.use(requireSession)
	.get("/", async (context) => {
		const user = await UserModel.findById(context.var.auth.userId)
			.select("authSalt encryptedVaultKey keyVersion")
			.lean();

		if (!user) {
			throw notFound("User not found");
		}

		const isWrapped =
			user.keyVersion === 2 && Boolean(user.encryptedVaultKey);

		return context.json({
			salt: user.authSalt ?? null,
			encryptedVaultKey: isWrapped
				? (user.encryptedVaultKey ?? null)
				: null,
			keyVersion: isWrapped ? 2 : 1,
		});
	})
	.post("/", async (context) => {
		const { salt, authHash, encryptedVaultKey } = await readBody({
			context,
			schema: z.object({
				salt: saltSchema,
				authHash: authHashSchema,
				encryptedVaultKey: encryptedVaultKeySchema,
			}),
		});
		const { userId } = context.var.auth;
		const { modifiedCount } = await UserModel.updateOne(
			{ _id: userId, authSalt: null },
			{
				authSalt: salt,
				authHash: await hashSecret(authHash),
				encryptedVaultKey,
				keyVersion: 2,
			},
		);

		if (modifiedCount !== 1) {
			throw apiError({
				status: 409,
				code: "ALREADY_SETUP",
				message: "A master password is already set for this vault",
			});
		}

		await recordAudit({
			context,
			userId,
			action: "vault_key_created",
			resourceType: "user",
			resourceId: userId,
		});

		return context.json({ keyVersion: 2 }, 201);
	})
	.put("/", async (context) => {
		const { authHash, encryptedVaultKey } = await readBody({
			context,
			schema: z.object({
				authHash: authHashSchema,
				encryptedVaultKey: encryptedVaultKeySchema,
			}),
		});
		const { userId } = context.var.auth;

		await enforceRateLimit({
			limit: "reauthenticateByUser",
			subject: userId,
		});

		const user = await UserModel.findById(userId).select(
			"authHash keyVersion",
		);

		if (
			!(await verifySecret({
				secret: authHash,
				secretHash: user?.authHash,
			}))
		) {
			throw invalidCredentials();
		}

		const { modifiedCount } = await UserModel.updateOne(
			{ _id: userId, keyVersion: { $ne: 2 } },
			{ encryptedVaultKey, keyVersion: 2 },
		);

		if (modifiedCount === 1) {
			await recordAudit({
				context,
				userId,
				action: "vault_key_upgraded",
				resourceType: "user",
				resourceId: userId,
			});
		}

		return context.json({ keyVersion: 2 });
	})
	.patch("/", async (context) => {
		const { currentAuthHash, salt, authHash, encryptedVaultKey } =
			await readBody({
				context,
				schema: z.object({
					currentAuthHash: authHashSchema,
					salt: saltSchema,
					authHash: authHashSchema,
					encryptedVaultKey: encryptedVaultKeySchema,
				}),
			});
		const { userId, sessionId } = context.var.auth;

		await enforceRateLimit({
			limit: "reauthenticateByUser",
			subject: userId,
		});

		const user = await UserModel.findById(userId)
			.select("authHash keyVersion")
			.lean();

		if (
			!user ||
			!(await verifySecret({
				secret: currentAuthHash,
				secretHash: user.authHash,
			}))
		) {
			throw invalidCredentials();
		}

		if (user.keyVersion !== 2) {
			throw apiError({
				status: 409,
				code: "LEGACY_VAULT_KEY",
				message:
					"Unlock your vault once before changing the master password",
			});
		}

		const { modifiedCount } = await UserModel.updateOne(
			{ _id: userId, keyVersion: 2, authHash: user.authHash },
			{
				authSalt: salt,
				authHash: await hashSecret(authHash),
				encryptedVaultKey,
			},
		);

		if (modifiedCount !== 1) {
			throw apiError({
				status: 409,
				code: "KEYS_CHANGED",
				message:
					"Your master password was changed elsewhere. Sign in again.",
			});
		}

		const { deletedCount } = await AuthSessionModel.deleteMany({
			userId,
			_id: { $ne: sessionId },
		});

		await recordAudit({
			context,
			userId,
			action: "master_password_changed",
			resourceType: "user",
			resourceId: userId,
			metadata: { revokedSessions: deletedCount },
		});

		return context.json({ revokedSessions: deletedCount });
	});

export { keyRoutes };
