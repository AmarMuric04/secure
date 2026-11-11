import { queryOptions } from "@tanstack/react-query";
import { getSession } from "secure-service";

const sessionQueryOptions = () =>
	queryOptions({
		queryKey: ["session"],
		queryFn: getSession,
		staleTime: 5 * 60_000,
		retry: false,
	});

export { sessionQueryOptions };
