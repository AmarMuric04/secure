import {
	decodeIdToken,
	generateCodeVerifier,
	generateState,
	Google,
} from "arctic";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";

import { CategoryModel, MfaChallengeModel, UserModel } from "../../db";
import { getEnv } from "../../env";
import { recordAudit } from "../../http/audit";
import { factory } from "../../http/factory";
import { enforceRateLimit, getClientIp } from "../../http/request";
import { startSession } from "../../http/session";
import { createToken, hashToken, isEqualSecret } from "../../security/tokens";
import { MFA_CHALLENGE_TTL_MS } from "./credentials";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "./defaults";
import { MFA_COOKIE } from "./mfa";

const STATE_COOKIE = "oauth_state";
const VERIFIER_COOKIE = "oauth_verifier";
const CALLBACK_PATH = "/api/auth/callback/google";
const FLOW_COOKIE_OPTIONS = {
	prefix: "host",
	path: "/",
	secure: true,
	httpOnly: true,
	sameSite: "Lax",
	maxAge: 600,
} as const;

const claimsSchema = z.object({
	sub: z.string().min(1),
	email: z.email().transform((email) => email.toLowerCase()),
	email_verified: z.literal(true),
	name: z.string().optional(),
	picture: z.url().optional(),
});

const createGoogleClient = (context: Context) => {
	const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = getEnv();

	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
		return null;
	}

	return new Google(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		`${new URL(context.req.url).origin}${CALLBACK_PATH}`,
	);
};

const findOrCreateGoogleUser = async (claims: z.infer<typeof claimsSchema>) => {
	const linkedUser = await UserModel.findOne({ googleId: claims.sub });

	if (linkedUser) {
		return linkedUser;
	}

	const emailUser = await UserModel.findOne({ email: claims.email });

	if (emailUser) {
		if (emailUser.authProvider !== "google" || emailUser.googleId) {
			return null;
		}

		emailUser.googleId = claims.sub;
		await emailUser.save();

		return emailUser;
	}

	const user = await UserModel.create({
		email: claims.email,
		name: claims.name,
		avatarUrl: claims.picture,
		authProvider: "google",
		googleId: claims.sub,
		emailVerified: true,
		emailVerifiedAt: new Date(),
		settings: DEFAULT_SETTINGS,
	});

	await CategoryModel.insertMany(
		DEFAULT_CATEGORIES.map((category) => ({
			...category,
			userId: user._id.toString(),
			isDefault: true,
		})),
	);

	return user;
};

const readClaims = async (context: Context) => {
	const google = createGoogleClient(context);
	const code = context.req.query("code");
	const state = context.req.query("state");
	const storedState = getCookie(context, STATE_COOKIE, "host");
	const codeVerifier = getCookie(context, VERIFIER_COOKIE, "host");

	deleteCookie(context, STATE_COOKIE, FLOW_COOKIE_OPTIONS);
	deleteCookie(context, VERIFIER_COOKIE, FLOW_COOKIE_OPTIONS);

	if (
		!google ||
		!code ||
		!state ||
		!storedState ||
		!codeVerifier ||
		!isEqualSecret({ left: state, right: storedState })
	) {
		return null;
	}

	const tokens = await google
		.validateAuthorizationCode(code, codeVerifier)
		.catch(() => null);

	if (!tokens) {
		return null;
	}

	const claims = claimsSchema.safeParse(decodeIdToken(tokens.idToken()));

	return claims.success ? claims.data : null;
};

const googleRoutes = factory
	.createApp()
	.get("/google", async (context) => {
		const google = createGoogleClient(context);

		if (!google) {
			return context.redirect("/login?error=oauth_unavailable");
		}

		await enforceRateLimit({
			limit: "oauthByIp",
			subject: getClientIp(context),
		});

		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const url = google.createAuthorizationURL(state, codeVerifier, [
			"openid",
			"email",
			"profile",
		]);

		setCookie(context, STATE_COOKIE, state, FLOW_COOKIE_OPTIONS);
		setCookie(context, VERIFIER_COOKIE, codeVerifier, FLOW_COOKIE_OPTIONS);

		return context.redirect(url.toString());
	})
	.get("/callback/google", async (context) => {
		const claims = await readClaims(context);

		if (!claims) {
			return context.redirect("/login?error=oauth_failed");
		}

		const user = await findOrCreateGoogleUser(claims);

		if (!user) {
			return context.redirect("/login?error=account_exists");
		}

		if (user.status !== "active") {
			return context.redirect("/login?error=account_disabled");
		}

		const userId = user._id.toString();

		if (user.mfaEnabled) {
			const mfaToken = createToken();

			await MfaChallengeModel.create({
				userId,
				tokenHash: hashToken(mfaToken),
				expiresAt: new Date(Date.now() + MFA_CHALLENGE_TTL_MS),
			});
			setCookie(context, MFA_COOKIE, mfaToken, {
				...FLOW_COOKIE_OPTIONS,
				maxAge: MFA_CHALLENGE_TTL_MS / 1_000,
			});

			return context.redirect("/login?step=mfa");
		}

		await startSession({ context, userId });
		await recordAudit({
			context,
			userId,
			action: "login",
			resourceType: "user",
			resourceId: userId,
			metadata: { provider: "google" },
		});

		return context.redirect("/vault");
	});

export { googleRoutes };
