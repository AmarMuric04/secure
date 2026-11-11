import { requestApi } from "../../../client";
import { vaultKeysSchema } from "./schema";

const getVaultKeys = () =>
	requestApi({ path: "/api/vault/keys", schema: vaultKeysSchema });

export { getVaultKeys };
