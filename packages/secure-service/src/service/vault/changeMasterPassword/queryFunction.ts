import { requestApi } from "../../../client";
import { changedMasterPasswordSchema } from "./schema";

const changeMasterPassword = (change: {
	currentAuthHash: string;
	salt: string;
	authHash: string;
	encryptedVaultKey: string;
}) =>
	requestApi({
		method: "PATCH",
		path: "/api/vault/keys",
		body: change,
		schema: changedMasterPasswordSchema,
	});

export { changeMasterPassword };
