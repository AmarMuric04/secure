import { requestApi } from "../../../client";
import { userResponseSchema } from "../../../schemas";

const confirmRegistration = (confirmation: { token: string; code: string }) =>
	requestApi({
		method: "POST",
		path: "/api/auth/register/confirm",
		body: confirmation,
		schema: userResponseSchema,
	});

export { confirmRegistration };
