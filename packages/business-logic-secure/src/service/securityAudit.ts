import {
	containsPersonalName,
	findDuplicateEntries,
	findSimilarPasswords,
	isInsecureUrl,
	isUnusedEntry,
} from "./hygieneChecks";
import { isStaleEntry } from "./passwordAge";
import { findSiteBreach } from "./siteBreaches";
import type { decryptVault } from "./vaultEntries";

const WEAK_STRENGTH_MAX = 1;

const SECURITY_ISSUES = [
	"compromised",
	"siteBreached",
	"weak",
	"personal",
	"reused",
	"similar",
	"stale",
	"insecure",
	"duplicate",
	"unused",
] as const;

const SECURITY_FILTER_KEYS = [
	"compromised",
	"weak",
	"reused",
	"stale",
	"tidy",
] as const;

const SECURITY_FILTERS: Record<
	(typeof SECURITY_FILTER_KEYS)[number],
	readonly (typeof SECURITY_ISSUES)[number][]
> = {
	compromised: ["compromised", "siteBreached"],
	weak: ["weak", "personal"],
	reused: ["reused", "similar"],
	stale: ["stale"],
	tidy: ["insecure", "duplicate", "unused"],
};

const isWeakEntry = (entry: { passwordStrength: number }) =>
	entry.passwordStrength <= WEAK_STRENGTH_MAX;

const isSuggestion = (issue: (typeof SECURITY_ISSUES)[number]) =>
	SECURITY_FILTERS.tidy.includes(issue);

const readIssueSeverity = (issue: (typeof SECURITY_ISSUES)[number]) => {
	if (SECURITY_FILTERS.compromised.includes(issue)) {
		return "urgent";
	}

	if (SECURITY_FILTERS.stale.includes(issue)) {
		return "notice";
	}

	if (isSuggestion(issue)) {
		return "suggestion";
	}

	return "warning";
};

const matchesFilter = ({
	issues,
	filter,
}: {
	issues: readonly (typeof SECURITY_ISSUES)[number][];
	filter: (typeof SECURITY_FILTER_KEYS)[number];
}) => issues.some((issue) => SECURITY_FILTERS[filter].includes(issue));

const auditVault = ({
	passwords,
	maxAgeDays,
	now,
	breachCatalog,
}: {
	passwords: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	maxAgeDays: number;
	now: number;
	breachCatalog:
		{ title: string; domain: string; breachDate: string }[] | null;
}) => {
	const similarById = findSimilarPasswords(passwords);
	const duplicateById = findDuplicateEntries(passwords);
	const siteBreachById = Object.fromEntries(
		passwords.flatMap((entry) => {
			const breach = breachCatalog
				? findSiteBreach({ entry, catalog: breachCatalog })
				: null;

			return breach ? [[entry.id, breach] as const] : [];
		}),
	);

	const readChecks = (entry: (typeof passwords)[number]) => ({
		compromised: entry.isCompromised,
		siteBreached: entry.id in siteBreachById,
		weak: isWeakEntry(entry),
		personal: containsPersonalName(entry),
		reused: entry.isReused,
		similar: entry.id in similarById,
		stale: isStaleEntry({ entry, maxAgeDays, now }),
		insecure: isInsecureUrl(entry.url),
		duplicate: entry.id in duplicateById,
		unused: isUnusedEntry({ entry, now }),
	});

	const issuesById = Object.fromEntries(
		passwords.map((entry) => {
			const checks = readChecks(entry);

			return [
				entry.id,
				SECURITY_ISSUES.filter((issue) => checks[issue]),
			] as const;
		}),
	);

	return {
		issuesById,
		similarById,
		duplicateById,
		siteBreachById,
		isBreachCatalogLoaded: breachCatalog !== null,
	};
};

const readEntryIssue = ({
	audit,
	id,
}: {
	audit: ReturnType<typeof auditVault> | null | undefined;
	id: string;
}) => audit?.issuesById[id]?.[0] ?? null;

export {
	auditVault,
	isSuggestion,
	matchesFilter,
	isWeakEntry,
	readEntryIssue,
	readIssueSeverity,
	SECURITY_FILTER_KEYS,
	SECURITY_FILTERS,
	SECURITY_ISSUES,
};
