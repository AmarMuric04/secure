const DAY_MILLISECONDS = 86_400_000;
const UNUSED_AFTER_DAYS = 365;
const USAGE_TRACKING_STARTED_AT = Date.parse("2026-11-11T00:00:00Z");
const MIN_SIMILAR_LENGTH = 6;
const MIN_STEM_LENGTH = 4;
const MAX_LENGTH_GAP = 3;
const MIN_NAME_TOKEN_LENGTH = 4;
const IGNORED_HOST_LABELS = [
	"www",
	"com",
	"net",
	"org",
	"app",
	"login",
	"account",
	"accounts",
];

const toHostname = (url: string | undefined) => {
	if (!url?.trim()) {
		return null;
	}

	try {
		const { hostname } = new URL(
			url.includes("://") ? url.trim() : `https://${url.trim()}`,
		);

		return hostname.toLowerCase().replace(/^www\./, "");
	} catch {
		return null;
	}
};

const toStem = (password: string) =>
	password.toLowerCase().replaceAll(/[^a-z]/g, "");

const readEditDistance = ({ from, to }: { from: string; to: string }) => {
	let previous = Array.from({ length: to.length + 1 }, (_, index) => index);

	[...from].forEach(($fromCharacter, $fromIndex) => {
		const current = [$fromIndex + 1];

		[...to].forEach(($toCharacter, $toIndex) => {
			current.push(
				Math.min(
					(previous[$toIndex + 1] ?? 0) + 1,
					(current[$toIndex] ?? 0) + 1,
					(previous[$toIndex] ?? 0) +
						($fromCharacter === $toCharacter ? 0 : 1),
				),
			);
		});

		previous = current;
	});

	return previous[to.length] ?? 0;
};

const isSimilarPassword = ({
	first,
	second,
}: {
	first: string;
	second: string;
}) => {
	if (first === second) {
		return false;
	}

	if (Math.min(first.length, second.length) < MIN_SIMILAR_LENGTH) {
		return false;
	}

	const firstStem = toStem(first);

	if (firstStem.length >= MIN_STEM_LENGTH && firstStem === toStem(second)) {
		return true;
	}

	if (Math.abs(first.length - second.length) > MAX_LENGTH_GAP) {
		return false;
	}

	const allowedEdits = Math.max(
		2,
		Math.floor(Math.max(first.length, second.length) * 0.2),
	);

	return (
		readEditDistance({
			from: first.toLowerCase(),
			to: second.toLowerCase(),
		}) <= allowedEdits
	);
};

const readNameTokens = (entry: {
	title: string;
	username?: string;
	url?: string;
}) => {
	const usernameTokens =
		(entry.username ?? "")
			.toLowerCase()
			.split("@")[0]
			?.split(/[^a-z0-9]+/) ?? [];
	const hostLabels = (toHostname(entry.url) ?? "").split(".").slice(0, -1);
	const titleTokens = entry.title.toLowerCase().split(/[^a-z0-9]+/);

	return [...usernameTokens, ...hostLabels, ...titleTokens].filter(
		(token, index, all) =>
			token.length >= MIN_NAME_TOKEN_LENGTH &&
			!/^\d+$/.test(token) &&
			!IGNORED_HOST_LABELS.includes(token) &&
			all.indexOf(token) === index,
	);
};

const containsPersonalName = (entry: {
	title: string;
	username?: string;
	url?: string;
	password: string;
}) => {
	const password = entry.password.toLowerCase();

	return readNameTokens(entry).some((token) => password.includes(token));
};

const isInsecureUrl = (url: string | undefined) =>
	/^http:\/\//i.test(url?.trim() ?? "");

const isUnusedEntry = ({
	entry,
	now,
}: {
	entry: { lastUsedAt: string | null; createdAt: string };
	now: number;
}) =>
	(now -
		(entry.lastUsedAt
			? new Date(entry.lastUsedAt).getTime()
			: Math.max(
					new Date(entry.createdAt).getTime(),
					USAGE_TRACKING_STARTED_AT,
				))) /
		DAY_MILLISECONDS >=
	UNUSED_AFTER_DAYS;

const groupRelatedEntries = <Entry extends { id: string }>({
	entries,
	isRelated,
}: {
	entries: Entry[];
	isRelated: (pair: { first: Entry; second: Entry }) => boolean;
}) =>
	Object.fromEntries(
		entries
			.map(
				(entry) =>
					[
						entry.id,
						entries
							.filter(
								(candidate) =>
									candidate.id !== entry.id &&
									isRelated({
										first: entry,
										second: candidate,
									}),
							)
							.map((candidate) => candidate.id),
					] as const,
			)
			.filter(([, relatedIds]) => relatedIds.length > 0),
	);

const findSimilarPasswords = (entries: { id: string; password: string }[]) =>
	groupRelatedEntries({
		entries,
		isRelated: ({ first, second }) =>
			isSimilarPassword({
				first: first.password,
				second: second.password,
			}),
	});

const findDuplicateEntries = (
	entries: { id: string; title: string; username?: string; url?: string }[],
) =>
	groupRelatedEntries({
		entries,
		isRelated: ({ first, second }) => {
			const firstSite =
				toHostname(first.url) ?? first.title.trim().toLowerCase();
			const secondSite =
				toHostname(second.url) ?? second.title.trim().toLowerCase();

			return (
				firstSite === secondSite &&
				(first.username ?? "").trim().toLowerCase() ===
					(second.username ?? "").trim().toLowerCase()
			);
		},
	});

export {
	containsPersonalName,
	findDuplicateEntries,
	findSimilarPasswords,
	isInsecureUrl,
	isSimilarPassword,
	isUnusedEntry,
	toHostname,
	UNUSED_AFTER_DAYS,
};
