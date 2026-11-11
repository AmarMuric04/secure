import { daysUntilPurge, TRASH_RETENTION_DAYS } from "./vaultList";

const DAY_MILLISECONDS = 86_400_000;
const WEEK_DAYS = 7;
const TRASH_DAY_GROUPS = [
	{ key: "today", label: "Today" },
	{ key: "yesterday", label: "Yesterday" },
	{ key: "week", label: "This week" },
	{ key: "earlier", label: "Earlier" },
] as const;

const toStartOfDay = (time: number) => {
	const date = new Date(time);

	date.setHours(0, 0, 0, 0);

	return date.getTime();
};

const readTrashDayGroupKey = ({
	deletedAt,
	now,
}: {
	deletedAt: string | null;
	now: number;
}) => {
	if (!deletedAt) {
		return "earlier";
	}

	const elapsedDays = Math.round(
		(toStartOfDay(now) - toStartOfDay(new Date(deletedAt).getTime())) /
			DAY_MILLISECONDS,
	);

	if (elapsedDays <= 0) {
		return "today";
	}

	if (elapsedDays === 1) {
		return "yesterday";
	}

	return elapsedDays < WEEK_DAYS ? "week" : "earlier";
};

const groupTrashByDeletionDay = <Entry extends { deletedAt: string | null }>({
	entries,
	now,
}: {
	entries: Entry[];
	now: number;
}) => {
	const newestFirst = [...entries].sort(($first, $second) =>
		($second.deletedAt ?? "").localeCompare($first.deletedAt ?? ""),
	);

	return TRASH_DAY_GROUPS.map((group) => ({
		...group,
		entries: newestFirst.filter(
			(entry) =>
				readTrashDayGroupKey({ deletedAt: entry.deletedAt, now }) ===
				group.key,
		),
	})).filter((group) => group.entries.length > 0);
};

const readPurgeCountdown = (deletedAt: string | null) => {
	const daysLeft = daysUntilPurge(deletedAt);

	return {
		daysLeft,
		ratio: daysLeft / TRASH_RETENTION_DAYS,
		isUrgent: daysLeft <= WEEK_DAYS,
	};
};

const buildCategoryFolders = <
	Category extends { id: string },
	Entry extends { categoryId: string | null; updatedAt: string },
>({
	categories,
	entries,
	previewSize,
}: {
	categories: Category[];
	entries: Entry[];
	previewSize: number;
}) =>
	categories.map((category) => {
		const categoryEntries = entries
			.filter((entry) => entry.categoryId === category.id)
			.sort(($first, $second) =>
				$second.updatedAt.localeCompare($first.updatedAt),
			);

		return {
			category,
			count: categoryEntries.length,
			previewEntries: categoryEntries.slice(0, previewSize),
		};
	});

const countFiledEntries = (folders: { count: number }[]) =>
	folders.reduce((total, folder) => total + folder.count, 0);

export {
	buildCategoryFolders,
	countFiledEntries,
	groupTrashByDeletionDay,
	readPurgeCountdown,
};
