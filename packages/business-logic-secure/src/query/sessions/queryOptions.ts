import { queryOptions } from "@tanstack/react-query";
import { getSessions } from "secure-service";

const sessionsQueryOptions = () =>
	queryOptions({
		queryKey: ["activeSessions"],
		queryFn: getSessions,
		select: (data) => data.sessions,
		staleTime: 30_000,
	});

export { sessionsQueryOptions };
