import { requestApi } from "../../../client";
import { userResponseSchema } from "../../../schemas";

const verifyMfa = (verification: {
	method: "totp" | "backup";
	code: string;
	mfaToken?: string;
}) =>
	requestApi({
		method: "POST",
		path: "/api/auth/mfa",
		body: verification,
		schema: userResponseSchema,
	});

export { verifyMfa };
