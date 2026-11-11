import type { Context } from "hono";
import type { z } from "zod";

import { consumeRateLimit } from "../security/rateLimit";
import { apiError } from "./errors";

const readBody = async <Schema extends z.ZodType>({
	context,
	schema,
}: {
	context: Context;
	schema: Schema;
}) => {
	const body: unknown = await context.req.json().catch(() => null);
	const result = schema.safeParse(body);

	if (!result.success) {
		throw apiError({
			status: 400,
			code: "VALIDATION_ERROR",
			message: "Invalid request data",
		});
	}

	return result.data;
};

const readQuery = <Schema extends z.ZodType>({
	context,
	schema,
}: {
	context: Context;
	schema: Schema;
}) => {
	const result = schema.safeParse(context.req.query());

	if (!result.success) {
		throw apiError({
			status: 400,
			code: "VALIDATION_ERROR",
			message: "Invalid query parameters",
		});
	}

	return result.data;
};

const getClientIp = (context: Context) =>
	context.req.header("x-real-ip") ?? "unknown";

const getUserAgent = (context: Context) =>
	context.req.header("user-agent")?.slice(0, 300) ?? "unknown";

const enforceRateLimit = async (
	request: Parameters<typeof consumeRateLimit>[0],
) => {
	const { isAllowed, retryAfterSeconds } = await consumeRateLimit(request);

	if (!isAllowed) {
		throw apiError({
			status: 429,
			code: "RATE_LIMITED",
			message: "Too many attempts. Please try again later.",
			retryAfterSeconds,
		});
	}
};

export { enforceRateLimit, getClientIp, getUserAgent, readBody, readQuery };
