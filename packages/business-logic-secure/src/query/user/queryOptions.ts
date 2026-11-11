import { queryOptions } from "@tanstack/react-query";
import { getMfaSetup } from "secure-service";

const mfaSetupQueryOptions = () =>
	queryOptions({
		queryKey: ["mfaSetup"],
		queryFn: getMfaSetup,
		staleTime: Infinity,
		gcTime: 0,
		retry: false,
	});

export { mfaSetupQueryOptions };
