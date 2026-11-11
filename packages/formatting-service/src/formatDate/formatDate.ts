const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
});

const formatDate = (date: string | Date) =>
	DATE_FORMATTER.format(new Date(date));

export { formatDate };
