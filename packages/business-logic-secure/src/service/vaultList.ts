import { isWeakEntry } from "./securityAudit";

const TRASH_RETENTION_DAYS = 30;
const DAY_MILLISECONDS = 86_400_000;
const PAGE_WINDOW_SIZE = 5;
const VAULT_SORT_FIELDS = [
	"title",
	"updatedAt",
	"createdAt",
	"passwordStrength",
] as const;
const SETTINGS_SORT_FIELDS: Record<
	"name" | "updated" | "created",
	(typeof VAULT_SORT_FIELDS)[number]
> = {
	name: "title",
	updated: "updatedAt",
	created: "createdAt",
};

const searchVaultEntries = <
	Entry extends {
		title: string;
		username?: string;
		url?: string;
		notes?: string;
		tags: string[];
	},
>({
	entries,
	query,
}: {
	entries: Entry[];
	query: string;
}) => {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return entries;
	}

	return entries.filter((entry) =>
		[
			entry.title,
			entry.username,
			entry.url,
			entry.notes,
			...entry.tags,
		].some((value) => value?.toLowerCase().includes(normalizedQuery)),
	);
};

const filterVaultEntries = <
	Entry extends {
		title: string;
		username?: string;
		url?: string;
		notes?: string;
		tags: string[];
		categoryId: string | null;
		favorite: boolean;
		passwordStrength: number;
	},
>({
	entries,
	query,
	categoryId,
	isWeakOnly,
	isFavoritesOnly,
}: {
	entries: Entry[];
	query: string;
	categoryId: string | null;
	isWeakOnly: boolean;
	isFavoritesOnly: boolean;
}) =>
	searchVaultEntries({ entries, query }).filter(
		(entry) =>
			(!categoryId || entry.categoryId === categoryId) &&
			(!isWeakOnly || isWeakEntry(entry)) &&
			(!isFavoritesOnly || entry.favorite),
	);

const compareVaultEntries = ({
	first,
	second,
	field,
}: {
	first: {
		title: string;
		updatedAt: string;
		createdAt: string;
		passwordStrength: number;
	};
	second: {
		title: string;
		updatedAt: string;
		createdAt: string;
		passwordStrength: number;
	};
	field: (typeof VAULT_SORT_FIELDS)[number];
}) => {
	if (field === "title") {
		return first.title.localeCompare(second.title);
	}

	if (field === "passwordStrength") {
		return first.passwordStrength - second.passwordStrength;
	}

	return new Date(first[field]).getTime() - new Date(second[field]).getTime();
};

const sortVaultEntries = <
	Entry extends Parameters<typeof compareVaultEntries>[0]["first"],
>({
	entries,
	field,
	order,
}: {
	entries: Entry[];
	field: (typeof VAULT_SORT_FIELDS)[number];
	order: "asc" | "desc";
}) => {
	const direction = order === "asc" ? 1 : -1;

	return [...entries].sort(
		($first, $second) =>
			compareVaultEntries({ first: $first, second: $second, field }) *
			direction,
	);
};

const toDefaultVaultSort = (defaultSort: keyof typeof SETTINGS_SORT_FIELDS) => {
	const field = SETTINGS_SORT_FIELDS[defaultSort];
	const order: "asc" | "desc" = field === "title" ? "asc" : "desc";

	return { field, order };
};

const toggleVaultSort = ({
	current,
	field,
}: {
	current: ReturnType<typeof toDefaultVaultSort>;
	field: (typeof VAULT_SORT_FIELDS)[number];
}) => {
	const order: "asc" | "desc" =
		current.field === field && current.order === "desc" ? "asc" : "desc";

	return { field, order };
};

const paginateEntries = <Entry>({
	entries,
	page,
	pageSize,
}: {
	entries: Entry[];
	page: number;
	pageSize: number;
}) => {
	const totalPages = Math.ceil(entries.length / pageSize);
	const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
	const startIndex = (currentPage - 1) * pageSize;

	return {
		items: entries.slice(startIndex, startIndex + pageSize),
		currentPage,
		totalPages,
		firstItemNumber: startIndex + 1,
		lastItemNumber: Math.min(startIndex + pageSize, entries.length),
	};
};

const listPageNumbers = ({
	currentPage,
	totalPages,
}: {
	currentPage: number;
	totalPages: number;
}) => {
	const firstPage = Math.min(
		Math.max(1, currentPage - Math.floor(PAGE_WINDOW_SIZE / 2)),
		Math.max(1, totalPages - PAGE_WINDOW_SIZE + 1),
	);

	return Array.from(
		{ length: Math.min(PAGE_WINDOW_SIZE, totalPages) },
		(_, index) => firstPage + index,
	);
};

const countVaultRisks = (
	entries: {
		passwordStrength: number;
		isCompromised: boolean;
		isReused: boolean;
	}[],
) => ({
	weak: entries.filter((entry) => isWeakEntry(entry)).length,
	compromised: entries.filter((entry) => entry.isCompromised).length,
	reused: entries.filter((entry) => entry.isReused).length,
	total: entries.length,
});

const listFavoriteEntries = <Entry extends { favorite: boolean }>(
	entries: Entry[],
) => entries.filter((entry) => entry.favorite);

const groupEntriesByInitial = <Entry extends { title: string }>(
	entries: Entry[],
) =>
	entries.reduce<{ initial: string; entries: Entry[] }[]>((groups, entry) => {
		const initial = (entry.title.charAt(0) || "#").toUpperCase();
		const lastGroup = groups.at(-1);

		if (lastGroup?.initial === initial) {
			lastGroup.entries.push(entry);

			return groups;
		}

		return [...groups, { initial, entries: [entry] }];
	}, []);

const listTrashedEntries = <Entry extends { deletedAt: string | null }>(
	entries: Entry[],
) => entries.filter((entry) => entry.deletedAt !== null);

const daysUntilPurge = (deletedAt: string | null) => {
	if (!deletedAt) {
		return TRASH_RETENTION_DAYS;
	}

	const elapsedDays = Math.floor(
		(Date.now() - new Date(deletedAt).getTime()) / DAY_MILLISECONDS,
	);

	return Math.max(0, TRASH_RETENTION_DAYS - elapsedDays);
};

export {
	countVaultRisks,
	daysUntilPurge,
	filterVaultEntries,
	groupEntriesByInitial,
	listFavoriteEntries,
	listPageNumbers,
	listTrashedEntries,
	paginateEntries,
	searchVaultEntries,
	sortVaultEntries,
	toDefaultVaultSort,
	toggleVaultSort,
	TRASH_RETENTION_DAYS,
	VAULT_SORT_FIELDS,
};
