import type { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { z } from "zod";

import { MfaChallengeModel, UserModel } from "../../db";
import { recordAudit } from "../../http/audit";
import { apiError } from "../../http/errors";
import { factory } from "../../http/factory";
import { enforceRateLimit, readBody } from "../../http/request";
import { totpCodeSchema } from "../../http/schemas";
import { toPublicUser } from "../../http/serializers";
import { startSession } from "../../http/session";
import { verifySecret } from "../../security/secrets";
import { findTotpStep } from "../../security/totp";
import { hashToken } from "../../security/tokens";

const MAX_MFA_ATTEMPTS = 5;
const MFA_COOKIE = "mfa";

const mfaBodySchema = z.discriminatedUnion("method", [
	z.object({
		method: z.literal("totp"),
		code: totpCodeSchema,
		mfaToken: z.string().min(1).optional(),
	}),
	z.object({
		method: z.literal("backup"),
		code: z
			.string()
			.trim()
			.regex(/^[a-f\d]{8,10}$/i)
			.transform((code) => code.toUpperCase()),
		mfaToken: z.string().min(1).optional(),
	}),
]);

const consumeTotpCode = async ({
	userId,
	secret,
	code,
	lastUsedStep,
}: {
	userId: string;
	secret: string;
	code: string;
	lastUsedStep: number;
}) => {
	const step = findTotpStep({ secret, code, lastUsedStep });

	if (step === null) {
		return false;
	}

	const { modifiedCount } = await UserModel.updateOne(
		{ _id: userId, mfaLastUsedStep: { $lt: step } },
		{ mfaLastUsedStep: step },
	);

	return modifiedCount === 1;
};

const consumeBackupCode = async ({
	userId,
	code,
	codeHashes,
}: {
	userId: string;
	code: string;
	codeHashes: string[];
}) => {
	for (const codeHash of codeHashes) {
		if (await verifySecret({ secret: code, secretHash: codeHash })) {
			const { modifiedCount } = await UserModel.updateOne(
				{ _id: userId, mfaBackupCodes: codeHash },
				{ $pull: { mfaBackupCodes: codeHash } },
			);

			return modifiedCount === 1;
		}
	}

	return false;
};

const verifySecondFactor = async ({
	user,
	method,
	code,
}: {
	user: {
		_id: { toString: () => string };
		mfaSecret?: string | null;
		mfaLastUsedStep?: number | null;
		mfaBackupCodes?: string[] | null;
	};
	method: "totp" | "backup";
	code: string;
}) => {
	const userId = user._id.toString();

	if (method === "backup") {
		return consumeBackupCode({
			userId,
			code,
			codeHashes: user.mfaBackupCodes ?? [],
		});
	}

	if (!user.mfaSecret) {
		return false;
	}

	return consumeTotpCode({
		userId,
		secret: user.mfaSecret,
		code,
		lastUsedStep: user.mfaLastUsedStep ?? 0,
	});
};

const takeChallenge = async ({
	context,
	mfaToken,
}: {
	context: Context;
	mfaToken?: string;
}) => {
	const token = mfaToken ?? getCookie(context, MFA_COOKIE, "host");

	if (!token) {
		return null;
	}

	return MfaChallengeModel.findOneAndUpdate(
		{
			tokenHash: hashToken(token),
			expiresAt: { $gt: new Date() },
			attempts: { $lt: MAX_MFA_ATTEMPTS },
		},
		{ $inc: { attempts: 1 } },
		{ returnDocument: "after" },
	).lean();
};

const mfaRoutes = factory.createApp().post("/mfa", async (context) => {
	const { method, code, mfaToken } = await readBody({
		context,
		schema: mfaBodySchema,
	});
	const challenge = await takeChallenge({ context, mfaToken });

	if (!challenge) {
		throw apiError({
			status: 401,
			code: "INVALID_CHALLENGE",
			message: "This sign-in attempt has expired. Please sign in again.",
		});
	}

	await enforceRateLimit({ limit: "mfaByUser", subject: challenge.userId });

	const user = await UserModel.findOne({
		_id: challenge.userId,
		status: "active",
		mfaEnabled: true,
	});

	if (!user || !(await verifySecondFactor({ user, method, code }))) {
		await recordAudit({
			context,
			userId: challenge.userId,
			action: "login_failed",
			resourceType: "user",
			metadata: { reason: "invalid_mfa_code", method },
		});

		throw apiError({
			status: 401,
			code: "INVALID_CODE",
			message: "Invalid verification code",
		});
	}

	const userId = user._id.toString();

	await MfaChallengeModel.deleteOne({ _id: challenge._id });
	deleteCookie(context, MFA_COOKIE, {
		prefix: "host",
		path: "/",
		secure: true,
	});
	await startSession({ context, userId });
	await recordAudit({
		context,
		userId,
		action: "login",
		resourceType: "user",
		resourceId: userId,
		metadata: { mfaMethod: method },
	});

	return context.json({ user: toPublicUser(user) });
});

export { MFA_COOKIE, mfaRoutes, verifySecondFactor };
