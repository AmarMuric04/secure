import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { revokeOtherSessions, revokeSession } from "secure-service";

import { sessionsQueryOptions } from "./queryOptions";

const useActiveSessions = () => useQuery(sessionsQueryOptions());

const useSessionsMutation = <Variables, Result>(
	mutationFn: (variables: Variables) => Promise<Result>,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: sessionsQueryOptions().queryKey,
			}),
	});
};

const useRevokeSession = () => useSessionsMutation(revokeSession);

const useRevokeOtherSessions = () => useSessionsMutation(revokeOtherSessions);

export { useActiveSessions, useRevokeOtherSessions, useRevokeSession };
