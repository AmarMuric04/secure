import { requestApi } from "../../../client";
import { upgradedKeySchema } from "./schema";

const upgradeVaultKey = (upgrade: {
	authHash: string;
	encryptedVaultKey: string;
}) =>
	requestApi({
		method: "PUT",
		path: "/api/vault/keys",
		body: upgrade,
		schema: upgradedKeySchema,
	});

export { upgradeVaultKey };
