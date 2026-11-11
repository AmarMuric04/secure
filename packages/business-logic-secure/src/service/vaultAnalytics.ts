import type { decryptVault } from "./vaultEntries";

import { type auditVault, isWeakEntry, matchesFilter } from "./securityAudit";

const STRONG_STRENGTH_MIN = 3;
const TOP_CATEGORY_LIMIT = 5;
const UNCATEGORIZED_LABEL = "Uncategorized";

const STRENGTH_BUCKETS = [
	{ label: "Very weak", strength: 0 },
	{ label: "Weak", strength: 1 },
	{ label: "Fair", strength: 2 },
	{ label: "Good", strength: 3 },
	{ label: "Strong", strength: 4 },
];

const toPercentage = ({ count, total }: { count: number; total: number }) =>
	total > 0 ? Math.round((count / total) * 100) : 0;

const countPasswordsByCategory = (
	passwords: Awaited<ReturnType<typeof decryptVault>>["passwords"],
) =>
	passwords.reduce<Record<string, number>>((counts, entry) => {
		if (!entry.categoryId) {
			return counts;
		}

		return {
			...counts,
			[entry.categoryId]: (counts[entry.categoryId] ?? 0) + 1,
		};
	}, {});

const filterCategories = ({
	categories,
	query,
}: {
	categories: Awaited<ReturnType<typeof decryptVault>>["categories"];
	query: string;
}) => {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return categories;
	}

	return categories.filter((category) =>
		category.name.toLowerCase().includes(normalizedQuery),
	);
};

const buildTopCategories = ({
	passwords,
	categories,
}: {
	passwords: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	categories: Awaited<ReturnType<typeof decryptVault>>["categories"];
}) => {
	const counts = passwords.reduce<Record<string, number>>(
		(accumulator, entry) => {
			const key = entry.categoryId ?? UNCATEGORIZED_LABEL;

			return { ...accumulator, [key]: (accumulator[key] ?? 0) + 1 };
		},
		{},
	);

	const ranked = Object.entries(counts)
		.map(([categoryId, count]) => ({
			key: categoryId,
			category:
				categoryId === UNCATEGORIZED_LABEL
					? UNCATEGORIZED_LABEL
					: (categories.find((category) => category.id === categoryId)
							?.name ?? "Unknown"),
			count,
		}))
		.toSorted(($first, $second) => $second.count - $first.count)
		.slice(0, TOP_CATEGORY_LIMIT);
	const largestCount = ranked[0]?.count ?? 0;

	return ranked.map((entry) => ({
		...entry,
		percentage: toPercentage({
			count: entry.count,
			total: passwords.length,
		}),
		ratio: largestCount > 0 ? entry.count / largestCount : 0,
	}));
};

const readHealthLevel = (percentage: number) => {
	if (percentage >= 80) {
		return "good";
	}

	if (percentage >= 50) {
		return "fair";
	}

	return "poor";
};

const readSecurityScoreLabel = (score: number) => {
	if (score >= 80) {
		return "Excellent";
	}

	if (score >= 60) {
		return "Good";
	}

	return "Needs Attention";
};

const buildVaultAnalytics = ({
	passwords,
	categories,
	maxAgeDays,
	audit,
}: {
	passwords: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	categories: Awaited<ReturnType<typeof decryptVault>>["categories"];
	maxAgeDays: number;
	audit: ReturnType<typeof auditVault>;
}) => {
	const total = passwords.length;

	if (total === 0) {
		return null;
	}

	const countFilter = (
		filter: Parameters<typeof matchesFilter>[0]["filter"],
	) =>
		passwords.filter((entry) =>
			matchesFilter({ issues: audit.issuesById[entry.id] ?? [], filter }),
		).length;
	const weak = passwords.filter((entry) => isWeakEntry(entry)).length;
	const compromised = countFilter("compromised");
	const reused = passwords.filter((entry) => entry.isReused).length;
	const strong = passwords.filter(
		(entry) => entry.passwordStrength >= STRONG_STRENGTH_MIN,
	).length;
	const stale = countFilter("stale");
	const categorized = passwords.filter((entry) => entry.categoryId).length;

	const flagged = (["compromised", "weak", "reused", "stale"] as const)
		.flatMap((filter) =>
			passwords.filter((entry) =>
				matchesFilter({
					issues: audit.issuesById[entry.id] ?? [],
					filter,
				}),
			),
		)
		.filter(
			(entry, index, all) =>
				all.findIndex((candidate) => candidate.id === entry.id) ===
				index,
		).length;

	return {
		securityScore: Math.min(
			100,
			Math.max(
				0,
				Math.round(
					((strong - weak - compromised - reused) / total) * 100,
				),
			),
		),
		strengthBreakdown: STRENGTH_BUCKETS.map((bucket) => {
			const count = passwords.filter(
				(entry) => entry.passwordStrength === bucket.strength,
			).length;

			return {
				...bucket,
				count,
				percentage: toPercentage({ count, total }),
			};
		}),
		healthChecks: (
			[
				{ key: "strong", label: "Strong passwords", count: strong },
				{ key: "unique", label: "Not reused", count: total - reused },
				{
					key: "safe",
					label: "Not found in a breach",
					count: total - compromised,
				},
				{
					key: "fresh",
					label:
						maxAgeDays > 0
							? `Changed in the last ${maxAgeDays} days`
							: "Changed recently",
					count: total - stale,
				},
				{
					key: "organized",
					label: "In a category",
					count: categorized,
				},
			] as const
		).map((check) => ({
			...check,
			percentage: toPercentage({ count: check.count, total }),
		})),
		topCategories: buildTopCategories({ passwords, categories }),
		stats: {
			total,
			weak: countFilter("weak"),
			compromised,
			reused: countFilter("reused"),
			stale,
			tidy: countFilter("tidy"),
			strong,
			issueCount: flagged,
		},
	};
};

export {
	buildVaultAnalytics,
	countPasswordsByCategory,
	filterCategories,
	readHealthLevel,
	readSecurityScoreLabel,
};
