import { requestApi } from "../../../client";
import { keyVersionSchema } from "./schema";

const createVaultKeys = (keys: {
	salt: string;
	authHash: string;
	encryptedVaultKey: string;
}) =>
	requestApi({
		method: "POST",
		path: "/api/vault/keys",
		body: keys,
		schema: keyVersionSchema,
	});

export { createVaultKeys };
