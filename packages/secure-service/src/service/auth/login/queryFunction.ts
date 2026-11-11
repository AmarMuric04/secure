import { requestApi } from "../../../client";
import { loginSchema } from "./schema";

const login = (credentials: { email: string; authHash: string }) =>
	requestApi({
		method: "POST",
		path: "/api/auth/login",
		body: credentials,
		schema: loginSchema,
	});

export { login };
