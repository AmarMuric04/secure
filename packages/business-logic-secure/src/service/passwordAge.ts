const DAY_MILLISECONDS = 86_400_000;
const DEFAULT_PASSWORD_MAX_AGE_DAYS = 90;
const PASSWORD_MAX_AGE_OPTIONS = [30, 60, 90, 180, 365, 0];

const readPasswordAgeDays = ({
	entry,
	now,
}: {
	entry: { passwordChangedAt: string | null; createdAt: string };
	now: number;
}) =>
	Math.floor(
		(now - new Date(entry.passwordChangedAt ?? entry.createdAt).getTime()) /
			DAY_MILLISECONDS,
	);

const isStaleEntry = ({
	entry,
	maxAgeDays,
	now,
}: {
	entry: { passwordChangedAt: string | null; createdAt: string };
	maxAgeDays: number;
	now: number;
}) => maxAgeDays > 0 && readPasswordAgeDays({ entry, now }) >= maxAgeDays;

const formatMaxAgeOption = (days: number) => {
	if (days === 0) {
		return "Never";
	}

	if (days === 365) {
		return "After a year";
	}

	return `After ${days} days`;
};

export {
	DEFAULT_PASSWORD_MAX_AGE_DAYS,
	formatMaxAgeOption,
	isStaleEntry,
	PASSWORD_MAX_AGE_OPTIONS,
	readPasswordAgeDays,
};
