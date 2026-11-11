import {
	type auditVault,
	isSuggestion,
	matchesFilter,
	SECURITY_FILTER_KEYS,
} from "./securityAudit";
import { buildSecurityReport } from "./securityReport";
import type { decryptVault } from "./vaultEntries";

const buildSecurityInbox = ({
	passwords,
	filter,
	audit,
}: {
	passwords: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	filter: (typeof SECURITY_FILTER_KEYS)[number] | undefined;
	audit: ReturnType<typeof auditVault>;
}) => {
	const report = buildSecurityReport({ passwords, audit });
	const total = passwords.length;
	const healthyCount = total - report.issues.length;
	const readIssues = (id: string) => audit.issuesById[id] ?? [];
	const countFilter = (key: (typeof SECURITY_FILTER_KEYS)[number]) =>
		passwords.filter((entry) =>
			matchesFilter({ issues: readIssues(entry.id), filter: key }),
		).length;
	const filtered = filter
		? passwords.filter((entry) =>
				matchesFilter({ issues: readIssues(entry.id), filter }),
			)
		: report.issues;

	return {
		total,
		healthyCount,
		healthyPercentage: total ? Math.round((healthyCount / total) * 100) : 0,
		issueCount: report.issues.length,
		counts: {
			compromised: countFilter("compromised"),
			weak: countFilter("weak"),
			reused: countFilter("reused"),
			stale: countFilter("stale"),
			tidy: countFilter("tidy"),
		},
		entries: filtered.map((entry) => {
			const relatedIds = [
				...(audit.similarById[entry.id] ?? []),
				...(audit.duplicateById[entry.id] ?? []),
			];

			return {
				entry,
				issues: readIssues(entry.id).filter(
					(issue) => filter === "tidy" || !isSuggestion(issue),
				),
				siteBreach: audit.siteBreachById[entry.id] ?? null,
				related: passwords
					.filter((candidate) => relatedIds.includes(candidate.id))
					.map((candidate) => ({
						id: candidate.id,
						title: candidate.title,
					})),
			};
		}),
	};
};

export { buildSecurityInbox };
