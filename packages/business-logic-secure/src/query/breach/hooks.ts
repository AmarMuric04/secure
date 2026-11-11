import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBreachFlag } from "secure-service";

import {
	readBreachFlagChanges,
	scanForBreaches,
} from "../../service/breachScan";
import { findSiteBreach } from "../../service/siteBreaches";
import type { decryptVault } from "../../service/vaultEntries";
import {
	breachCatalogQueryOptions,
	pwnedRangeQueryOptions,
} from "./queryOptions";

const useCheckBreaches = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			passwords: Awaited<ReturnType<typeof decryptVault>>["passwords"],
		) => {
			const [breachCounts, catalog] = await Promise.all([
				scanForBreaches({
					passwords,
					fetchRange: (prefix) =>
						queryClient.fetchQuery(pwnedRangeQueryOptions(prefix)),
				}),
				queryClient.fetchQuery(breachCatalogQueryOptions()),
			]);

			await Promise.all(
				readBreachFlagChanges({ passwords, breachCounts }).map(
					updateBreachFlag,
				),
			);

			return {
				checkedCount: Object.keys(breachCounts).length,
				breachedCount: Object.values(breachCounts).filter(
					(count) => count > 0,
				).length,
				siteBreachedCount: passwords.filter((entry) =>
					findSiteBreach({ entry, catalog }),
				).length,
			};
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault"] }),
	});
};

export { useCheckBreaches };
