import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { markPasswordUsed } from "secure-service";

import { DEFAULT_PASSWORD_MAX_AGE_DAYS } from "../../service/passwordAge";
import { auditVault } from "../../service/securityAudit";
import type { decryptVault } from "../../service/vaultEntries";
import { useSession } from "../auth/hooks";
import { breachCatalogQueryOptions } from "../breach/queryOptions";
import { useVault } from "../vault/hooks";

const useVaultAudit = () => {
	const vault = useVault({ includeDeleted: false });
	const { data: user } = useSession();
	const catalog = useQuery({
		...breachCatalogQueryOptions(),
		enabled: false,
	});

	const maxAgeDays =
		user?.settings.passwordMaxAgeDays ?? DEFAULT_PASSWORD_MAX_AGE_DAYS;

	return useQuery({
		queryKey: [
			"vault",
			"audit",
			vault.dataUpdatedAt,
			catalog.dataUpdatedAt,
			maxAgeDays,
		],
		queryFn: () =>
			auditVault({
				passwords: vault.data?.passwords ?? [],
				maxAgeDays,
				now: Date.now(),
				breachCatalog: catalog.data ?? null,
			}),
		enabled: !!vault.data,
		staleTime: Infinity,
	});
};

const useMarkPasswordUsed = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await markPasswordUsed(id);

			return id;
		},
		onSuccess: (id) => {
			const usedAt = new Date().toISOString();

			queryClient.setQueriesData<
				Awaited<ReturnType<typeof decryptVault>>
			>({ queryKey: ["vault"] }, (data) =>
				data && "passwords" in data
					? {
							...data,
							passwords: data.passwords.map((entry) =>
								entry.id === id
									? { ...entry, lastUsedAt: usedAt }
									: entry,
							),
						}
					: data,
			);
		},
	});
};

export { useMarkPasswordUsed, useVaultAudit };
