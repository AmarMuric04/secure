const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("en-US", {
	numeric: "auto",
});
const UNITS = [
	{ unit: "year", seconds: 31_536_000 },
	{ unit: "month", seconds: 2_592_000 },
	{ unit: "day", seconds: 86_400 },
	{ unit: "hour", seconds: 3_600 },
	{ unit: "minute", seconds: 60 },
] as const;

const formatRelativeTime = (date: string | Date) => {
	const elapsedSeconds = (Date.now() - new Date(date).getTime()) / 1_000;
	const match = UNITS.find(
		({ seconds }) => Math.abs(elapsedSeconds) >= seconds,
	);

	if (!match) {
		return "just now";
	}

	return RELATIVE_FORMATTER.format(
		-Math.round(elapsedSeconds / match.seconds),
		match.unit,
	);
};

export { formatRelativeTime };
