import { requestApi } from "../../../client";
import { userResponseSchema } from "../../../schemas";

const disableMfa = (confirmation: { authHash: string; code: string }) =>
	requestApi({
		method: "DELETE",
		path: "/api/user/mfa",
		body: confirmation,
		schema: userResponseSchema,
	});

export { disableMfa };
