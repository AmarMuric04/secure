import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const apiError = ({
	status,
	code,
	message,
	retryAfterSeconds,
}: {
	status: ContentfulStatusCode;
	code: string;
	message: string;
	retryAfterSeconds?: number;
}) =>
	new HTTPException(status, {
		res: Response.json(
			{ error: { code, message } },
			{
				status,
				headers: retryAfterSeconds
					? { "Retry-After": String(retryAfterSeconds) }
					: {},
			},
		),
	});

const invalidCredentials = () =>
	apiError({
		status: 401,
		code: "INVALID_CREDENTIALS",
		message: "Incorrect email or master password",
	});

const notFound = (message: string) =>
	apiError({ status: 404, code: "NOT_FOUND", message });

export { apiError, invalidCredentials, notFound };
