import { toHostname } from "./hygieneChecks";

const matchesDomain = ({
	hostname,
	domain,
}: {
	hostname: string;
	domain: string;
}) => hostname === domain || hostname.endsWith(`.${domain}`);

const findSiteBreach = ({
	entry,
	catalog,
}: {
	entry: {
		url?: string;
		passwordChangedAt: string | null;
		createdAt: string;
	};
	catalog: { title: string; domain: string; breachDate: string }[];
}) => {
	const hostname = toHostname(entry.url);

	if (!hostname) {
		return null;
	}

	const changedAt = new Date(
		entry.passwordChangedAt ?? entry.createdAt,
	).getTime();

	return (
		catalog
			.filter(
				(breach) =>
					matchesDomain({ hostname, domain: breach.domain }) &&
					new Date(breach.breachDate).getTime() > changedAt,
			)
			.toSorted(
				($first, $second) =>
					new Date($second.breachDate).getTime() -
					new Date($first.breachDate).getTime(),
			)[0] ?? null
	);
};

export { findSiteBreach };
