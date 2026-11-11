import { useMutation, useQueryClient } from "@tanstack/react-query";

import { replaceMasterPassword } from "../../service/vaultKeys";
import { openVault } from "../../vaultSession";
import { sessionsQueryOptions } from "../sessions/queryOptions";
import { vaultKeysQueryOptions } from "../vault/queryOptions";

const useChangeMasterPassword = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (change: {
			currentPassword: string;
			nextPassword: string;
		}) => {
			const { vaultKey, revokedSessions } =
				await replaceMasterPassword(change);

			openVault(vaultKey);

			return { revokedSessions };
		},
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: vaultKeysQueryOptions().queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: sessionsQueryOptions().queryKey,
				}),
			]),
	});
};

export { useChangeMasterPassword };
