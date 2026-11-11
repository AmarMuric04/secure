import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { AuthSessionModel, UserModel } from "../db";
import { createToken, hashToken } from "../security/tokens";
import { apiError } from "./errors";
import { factory } from "./factory";
import { getClientIp, getUserAgent } from "./request";

const SESSION_COOKIE = "session";
const HOUR_MS = 60 * 60 * 1_000;
const IDLE_TIMEOUT_MS = 7 * 24 * HOUR_MS;
const ABSOLUTE_TIMEOUT_MS = 30 * 24 * HOUR_MS;
const TOUCH_INTERVAL_MS = HOUR_MS;

const startSession = async ({
	context,
	userId,
}: {
	context: Context;
	userId: string;
}) => {
	const token = createToken();
	const now = Date.now();
	const absoluteExpiresAt = new Date(now + ABSOLUTE_TIMEOUT_MS);

	await AuthSessionModel.create({
		userId,
		tokenHash: hashToken(token),
		userAgent: getUserAgent(context),
		ipAddress: getClientIp(context),
		lastActiveAt: new Date(now),
		expiresAt: new Date(now + IDLE_TIMEOUT_MS),
		absoluteExpiresAt,
	});

	await UserModel.updateOne(
		{ _id: userId },
		{ lastLoginAt: new Date(now), lastActiveAt: new Date(now) },
	);

	setCookie(context, SESSION_COOKIE, token, {
		prefix: "host",
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "Strict",
		maxAge: ABSOLUTE_TIMEOUT_MS / 1_000,
	});
};

const findSession = async (context: Context) => {
	const token = getCookie(context, SESSION_COOKIE, "host");

	if (!token) {
		return null;
	}

	const now = Date.now();
	const session = await AuthSessionModel.findOne({
		tokenHash: hashToken(token),
		expiresAt: { $gt: new Date(now) },
		absoluteExpiresAt: { $gt: new Date(now) },
	}).lean();

	if (!session) {
		return null;
	}

	if (now - session.lastActiveAt.getTime() > TOUCH_INTERVAL_MS) {
		await AuthSessionModel.updateOne(
			{ _id: session._id },
			{
				lastActiveAt: new Date(now),
				expiresAt: new Date(
					Math.min(
						now + IDLE_TIMEOUT_MS,
						session.absoluteExpiresAt.getTime(),
					),
				),
			},
		);
	}

	return { userId: session.userId, sessionId: session._id.toString() };
};

const endSession = async (context: Context) => {
	const token = getCookie(context, SESSION_COOKIE, "host");

	if (token) {
		await AuthSessionModel.deleteOne({ tokenHash: hashToken(token) });
	}

	deleteCookie(context, SESSION_COOKIE, {
		prefix: "host",
		path: "/",
		secure: true,
	});
};

const endAllSessions = (userId: string) =>
	AuthSessionModel.deleteMany({ userId });

const requireSession = factory.createMiddleware(async ($context, $next) => {
	const session = await findSession($context);

	if (!session) {
		throw apiError({
			status: 401,
			code: "UNAUTHORIZED",
			message: "Not signed in",
		});
	}

	const isActive = await UserModel.exists({
		_id: session.userId,
		status: "active",
	});

	if (!isActive) {
		await endSession($context);
		throw apiError({
			status: 401,
			code: "UNAUTHORIZED",
			message: "Not signed in",
		});
	}

	$context.set("auth", session);
	await $next();
});

export { endAllSessions, endSession, requireSession, startSession };
