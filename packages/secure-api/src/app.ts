import { HTTPException } from "hono/http-exception";

import { connectDatabase } from "./db";
import { apiError } from "./http/errors";
import { factory } from "./http/factory";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/user";
import { vaultRoutes } from "./routes/vault";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CLIENT_HEADER = "x-secure-client";

const rejectCrossSiteWrites = factory.createMiddleware(
	async ($context, $next) => {
		const fetchSite = $context.req.header("sec-fetch-site");
		const isCrossSite =
			fetchSite !== undefined && fetchSite !== "same-origin";

		if (
			!SAFE_METHODS.has($context.req.method) &&
			(isCrossSite || $context.req.header(CLIENT_HEADER) !== "web")
		) {
			throw apiError({
				status: 403,
				code: "FORBIDDEN",
				message: "Cross-site request rejected",
			});
		}

		await $next();
	},
);

const app = factory
	.createApp()
	.basePath("/api")
	.use(async ($context, $next) => {
		await $next();
		$context.header("Cache-Control", "no-store");
	})
	.use(rejectCrossSiteWrites)
	.use(async (_context, $next) => {
		await connectDatabase();
		await $next();
	})
	.route("/auth", authRoutes)
	.route("/vault", vaultRoutes)
	.route("/user", userRoutes)
	.notFound((context) =>
		context.json(
			{ error: { code: "NOT_FOUND", message: "Not found" } },
			404,
		),
	)
	.onError(($error, $context) => {
		if ($error instanceof HTTPException) {
			return $error.getResponse();
		}

		console.error("Unhandled API error", $error);

		return $context.json(
			{
				error: {
					code: "INTERNAL_ERROR",
					message: "An unexpected error occurred",
				},
			},
			500,
		);
	});

const handle = (request: Request) => app.fetch(request);

export { app, handle };
