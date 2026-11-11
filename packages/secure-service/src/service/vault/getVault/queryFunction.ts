import { requestApi } from "../../../client";
import { vaultSchema } from "./schema";

const getVault = ({ includeDeleted }: { includeDeleted: boolean }) =>
	requestApi({
		path: includeDeleted ? "/api/vault?includeDeleted=true" : "/api/vault",
		schema: vaultSchema,
	});

export { getVault };
