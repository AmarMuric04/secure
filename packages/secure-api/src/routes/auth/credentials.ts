import { z } from "zod";

import {
	CategoryModel,
	MfaChallengeModel,
	PendingRegistrationModel,
	UserModel,
} from "../../db";
import { sendVerificationCode } from "../../email/sendVerificationCode";
import { recordAudit } from "../../http/audit";
import { apiError, invalidCredentials } from "../../http/errors";
import { factory } from "../../http/factory";
import { enforceRateLimit, getClientIp, readBody } from "../../http/request";
import {
	authHashSchema,
	emailSchema,
	encryptedVaultKeySchema,
	saltSchema,
} from "../../http/schemas";
import { toPublicUser } from "../../http/serializers";
import { startSession } from "../../http/session";
import { hashSecret, verifySecret } from "../../security/secrets";
import {
	createNumericCode,
	createToken,
	hashToken,
	isEqualSecret,
	signValue,
} from "../../security/tokens";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "./defaults";

const MINUTE_MS = 60_000;
const REGISTRATION_TTL_MS = 15 * MINUTE_MS;
const MFA_CHALLENGE_TTL_MS = 5 * MINUTE_MS;
const MAX_CODE_ATTEMPTS = 5;

const credentialRoutes = factory
	.createApp()
	.post("/salt", async (context) => {
		const { email } = await readBody({
			context,
			schema: z.object({ email: emailSchema }),
		});

		await enforceRateLimit({
			limit: "saltByIp",
			subject: getClientIp(context),
		});

		const user = await UserModel.findOne({ email, status: "active" })
			.select("authSalt")
			.lean();

		return context.json({
			salt: user?.authSalt ?? signValue(`salt:${email}`),
		});
	})
	.post("/register", async (context) => {
		const registration = await readBody({
			context,
			schema: z.object({
				email: emailSchema,
				name: z.string().trim().min(2).max(100).optional(),
				authHash: authHashSchema,
				salt: saltSchema,
				encryptedVaultKey: encryptedVaultKeySchema,
			}),
		});

		await enforceRateLimit({
			limit: "registerByIp",
			subject: getClientIp(context),
		});
		await enforceRateLimit({
			limit: "registerByEmail",
			subject: registration.email,
		});

		if (await UserModel.exists({ email: registration.email })) {
			throw apiError({
				status: 409,
				code: "EMAIL_EXISTS",
				message: "An account with this email already exists",
			});
		}

		const token = createToken();
		const code = createNumericCode(6);

		await PendingRegistrationModel.deleteMany({
			email: registration.email,
		});
		await PendingRegistrationModel.create({
			...registration,
			tokenHash: hashToken(token),
			codeHash: signValue(`registration:${code}`),
			expiresAt: new Date(Date.now() + REGISTRATION_TTL_MS),
		});

		try {
			await sendVerificationCode({
				email: registration.email,
				code,
				name: registration.name,
			});
		} catch (error) {
			console.error("Verification email failed", error);
			await PendingRegistrationModel.deleteOne({
				tokenHash: hashToken(token),
			});
			throw apiError({
				status: 502,
				code: "EMAIL_FAILED",
				message:
					"Failed to send the verification email. Please try again.",
			});
		}

		return context.json({ token });
	})
	.post("/register/confirm", async (context) => {
		const { token, code } = await readBody({
			context,
			schema: z.object({
				token: z.string().min(1),
				code: z.string().regex(/^\d{6}$/),
			}),
		});
		const pending = await PendingRegistrationModel.findOneAndUpdate(
			{
				tokenHash: hashToken(token),
				expiresAt: { $gt: new Date() },
				attempts: { $lt: MAX_CODE_ATTEMPTS },
			},
			{ $inc: { attempts: 1 } },
			{ returnDocument: "after" },
		).lean();

		if (!pending) {
			throw apiError({
				status: 400,
				code: "INVALID_TOKEN",
				message: "This code has expired. Please start again.",
			});
		}

		if (
			!isEqualSecret({
				left: signValue(`registration:${code}`),
				right: pending.codeHash,
			})
		) {
			throw apiError({
				status: 400,
				code: "INVALID_CODE",
				message: "Invalid verification code",
			});
		}

		await PendingRegistrationModel.deleteOne({ _id: pending._id });

		if (await UserModel.exists({ email: pending.email })) {
			throw apiError({
				status: 409,
				code: "EMAIL_EXISTS",
				message: "An account with this email already exists",
			});
		}

		const user = await UserModel.create({
			email: pending.email,
			name: pending.name,
			authProvider: "credentials",
			authHash: await hashSecret(pending.authHash),
			authSalt: pending.salt,
			encryptedVaultKey: pending.encryptedVaultKey,
			keyVersion: 2,
			emailVerified: true,
			emailVerifiedAt: new Date(),
			settings: DEFAULT_SETTINGS,
		});
		const userId = user._id.toString();

		await CategoryModel.insertMany(
			DEFAULT_CATEGORIES.map((category) => ({
				...category,
				userId,
				isDefault: true,
			})),
		);
		await startSession({ context, userId });
		await recordAudit({
			context,
			userId,
			action: "login",
			resourceType: "user",
			resourceId: userId,
			metadata: { registration: true },
		});

		return context.json({ user: toPublicUser(user) }, 201);
	})
	.post("/login", async (context) => {
		const { email, authHash } = await readBody({
			context,
			schema: z.object({ email: emailSchema, authHash: authHashSchema }),
		});

		await enforceRateLimit({
			limit: "loginByIp",
			subject: getClientIp(context),
		});
		await enforceRateLimit({ limit: "loginByEmail", subject: email });

		const user = await UserModel.findOne({ email, status: "active" });
		const isValid = await verifySecret({
			secret: authHash,
			secretHash: user?.authHash,
		});

		if (!user || !isValid) {
			if (user) {
				await recordAudit({
					context,
					userId: user._id.toString(),
					action: "login_failed",
					resourceType: "user",
					metadata: { reason: "invalid_password" },
				});
			}

			throw invalidCredentials();
		}

		const userId = user._id.toString();

		if (user.mfaEnabled) {
			const mfaToken = createToken();

			await MfaChallengeModel.create({
				userId,
				tokenHash: hashToken(mfaToken),
				expiresAt: new Date(Date.now() + MFA_CHALLENGE_TTL_MS),
			});

			return context.json({ status: "mfa" as const, mfaToken });
		}

		await startSession({ context, userId });
		await recordAudit({
			context,
			userId,
			action: "login",
			resourceType: "user",
			resourceId: userId,
		});

		return context.json({
			status: "authenticated" as const,
			user: toPublicUser(user),
		});
	});

export { credentialRoutes, MFA_CHALLENGE_TTL_MS };
