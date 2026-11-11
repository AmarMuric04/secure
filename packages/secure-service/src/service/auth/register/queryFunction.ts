import { requestApi } from "../../../client";
import { registrationSchema } from "./schema";

const register = (registration: {
	email: string;
	name?: string;
	authHash: string;
	salt: string;
	encryptedVaultKey: string;
}) =>
	requestApi({
		method: "POST",
		path: "/api/auth/register",
		body: registration,
		schema: registrationSchema,
	});

export { register };
