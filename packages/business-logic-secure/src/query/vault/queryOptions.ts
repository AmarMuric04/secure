import { queryOptions } from "@tanstack/react-query";
import { getVault, getVaultKeys } from "secure-service";

import { decryptVault } from "../../service/vaultEntries";

const vaultQueryOptions = ({
	includeDeleted,
	generation,
}: {
	includeDeleted: boolean;
	generation: number;
}) =>
	queryOptions({
		queryKey: ["vault", generation, includeDeleted],
		queryFn: async () => decryptVault(await getVault({ includeDeleted })),
		staleTime: 30_000,
	});

const vaultKeysQueryOptions = () =>
	queryOptions({
		queryKey: ["vaultKeys"],
		queryFn: getVaultKeys,
		staleTime: 5 * 60_000,
	});

export { vaultKeysQueryOptions, vaultQueryOptions };
