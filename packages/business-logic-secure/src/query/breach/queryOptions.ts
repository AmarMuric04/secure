import { queryOptions } from "@tanstack/react-query";
import { getBreachCatalog, getPwnedRange } from "secure-service";

const pwnedRangeQueryOptions = (prefix: string) =>
	queryOptions({
		queryKey: ["pwnedRange", prefix],
		queryFn: () => getPwnedRange(prefix),
		staleTime: Infinity,
	});

const breachCatalogQueryOptions = () =>
	queryOptions({
		queryKey: ["breachCatalog"],
		queryFn: getBreachCatalog,
		staleTime: Infinity,
	});

export { breachCatalogQueryOptions, pwnedRangeQueryOptions };
