import { RateLimitBucketModel } from "../db";

const MINUTE = 60_000;

const RATE_LIMITS = {
	saltByIp: { windowMs: 15 * MINUTE, maxAttempts: 60 },
	loginByIp: { windowMs: 15 * MINUTE, maxAttempts: 30 },
	loginByEmail: { windowMs: 15 * MINUTE, maxAttempts: 10 },
	mfaByUser: { windowMs: 15 * MINUTE, maxAttempts: 10 },
	registerByIp: { windowMs: 60 * MINUTE, maxAttempts: 10 },
	registerByEmail: { windowMs: 60 * MINUTE, maxAttempts: 3 },
	reauthenticateByUser: { windowMs: 15 * MINUTE, maxAttempts: 10 },
	oauthByIp: { windowMs: 15 * MINUTE, maxAttempts: 30 },
} as const;

const consumeRateLimit = async ({
	limit,
	subject,
}: {
	limit: keyof typeof RATE_LIMITS;
	subject: string;
}) => {
	const { windowMs, maxAttempts } = RATE_LIMITS[limit];
	const windowIndex = Math.floor(Date.now() / windowMs);
	const bucket = await RateLimitBucketModel.findOneAndUpdate(
		{ key: `${limit}:${subject}:${windowIndex}` },
		{
			$inc: { count: 1 },
			$setOnInsert: { expiresAt: new Date((windowIndex + 1) * windowMs) },
		},
		{ upsert: true, returnDocument: "after" },
	).lean();

	return {
		isAllowed: bucket.count <= maxAttempts,
		retryAfterSeconds: Math.ceil(
			((windowIndex + 1) * windowMs - Date.now()) / 1_000,
		),
	};
};

export { consumeRateLimit };
