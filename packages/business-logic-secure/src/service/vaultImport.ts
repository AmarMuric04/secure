const FALLBACK_TITLE = "Imported login";

const COLUMN_ALIASES = {
	title: ["name", "title", "account", "item"],
	url: ["url", "login_uri", "website", "uri", "web site", "login url"],
	username: [
		"username",
		"login_username",
		"user",
		"login",
		"email",
		"user name",
	],
	password: ["password", "login_password", "pass"],
	notes: ["note", "notes", "extra", "comments"],
	folder: ["folder", "grouping", "group", "category"],
	favorite: ["favorite", "fav", "favourite"],
	type: ["type"],
	tags: ["tags"],
};

const FORMAT_SIGNATURES = [
	{ label: "Bitwarden", headers: ["login_uri", "login_password"] },
	{ label: "Firefox", headers: ["httprealm", "formactionorigin"] },
	{ label: "1Password", headers: ["otpauth"] },
	{ label: "1Password", headers: ["archived"] },
	{ label: "Chrome or Edge", headers: ["name", "url", "username", "note"] },
];

const toHostname = (url: string | undefined) => {
	if (!url) {
		return null;
	}

	try {
		return new URL(url.includes("://") ? url : `https://${url}`).hostname
			.replace(/^www\./, "")
			.toLowerCase();
	} catch {
		return null;
	}
};

const parseCsv = (text: string) => {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let isQuoted = false;
	const source = text.replace(/^\uFEFF/, "");

	for (let index = 0; index < source.length; index += 1) {
		const character = source.charAt(index);

		if (isQuoted) {
			if (character === '"' && source.charAt(index + 1) === '"') {
				field += '"';
				index += 1;
			} else if (character === '"') {
				isQuoted = false;
			} else {
				field += character;
			}

			continue;
		}

		if (character === '"') {
			isQuoted = true;
		} else if (character === ",") {
			row.push(field);
			field = "";
		} else if (character === "\n" || character === "\r") {
			if (character === "\r" && source.charAt(index + 1) === "\n") {
				index += 1;
			}

			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else {
			field += character;
		}
	}

	if (field || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	return rows.filter((cells) => cells.some((cell) => cell.trim()));
};

const normalizeHeader = (header: string) =>
	header.trim().toLowerCase().replace(/\s+/g, " ");

const findColumn = ({
	headers,
	aliases,
}: {
	headers: string[];
	aliases: string[];
}) => {
	const index = headers.findIndex((header) => aliases.includes(header));

	return index === -1 ? null : index;
};

const detectCsvColumns = (headerRow: string[]) => {
	const headers = headerRow.map(normalizeHeader);
	const format =
		FORMAT_SIGNATURES.find((signature) =>
			signature.headers.every((header) => headers.includes(header)),
		)?.label ?? "CSV";
	const columns = {
		title: findColumn({ headers, aliases: COLUMN_ALIASES.title }),
		url: findColumn({ headers, aliases: COLUMN_ALIASES.url }),
		username: findColumn({ headers, aliases: COLUMN_ALIASES.username }),
		password: findColumn({ headers, aliases: COLUMN_ALIASES.password }),
		notes: findColumn({ headers, aliases: COLUMN_ALIASES.notes }),
		folder: findColumn({ headers, aliases: COLUMN_ALIASES.folder }),
		favorite: findColumn({ headers, aliases: COLUMN_ALIASES.favorite }),
		type: findColumn({ headers, aliases: COLUMN_ALIASES.type }),
		tags: findColumn({ headers, aliases: COLUMN_ALIASES.tags }),
	};

	return { format, columns };
};

const readCell = ({
	cells,
	column,
}: {
	cells: string[];
	column: number | null;
}) => (column === null ? "" : (cells[column] ?? "").trim());

const toOptional = (value: string) => value || undefined;

const toImportTitle = ({
	title,
	url,
	username,
}: {
	title: string;
	url: string;
	username: string;
}) => title || toHostname(url) || username || FALLBACK_TITLE;

const readCsvImport = (text: string) => {
	const [headerRow, ...dataRows] = parseCsv(text);

	if (!headerRow) {
		return { format: "CSV", candidates: [], invalid: [] };
	}

	const { format, columns } = detectCsvColumns(headerRow);

	if (columns.password === null) {
		throw new Error(
			"This file has no password column. Export a CSV of your logins and try again.",
		);
	}

	const rows = dataRows.map((cells, index) => {
		const read = (column: number | null) => readCell({ cells, column });
		const type = read(columns.type).toLowerCase();
		const url = read(columns.url);
		const username = read(columns.username);
		const password = read(columns.password);
		const rowNumber = index + 2;

		if (type && type !== "login") {
			return { rowNumber, error: `Skipped a ${type} item` };
		}

		if (!password) {
			return { rowNumber, error: "No password" };
		}

		return {
			rowNumber,
			entry: {
				title: toImportTitle({
					title: read(columns.title),
					url,
					username,
				}),
				username: toOptional(username),
				password,
				url: toOptional(url),
				notes: toOptional(read(columns.notes)),
				categoryName: toOptional(read(columns.folder)) ?? null,
				tags: read(columns.tags)
					.split(/[,;]/)
					.map((tag) => tag.trim())
					.filter(Boolean),
				favorite: ["1", "true", "yes"].includes(
					read(columns.favorite).toLowerCase(),
				),
			},
		};
	});

	return {
		format,
		candidates: rows.flatMap((row) =>
			"entry" in row && row.entry
				? [{ rowNumber: row.rowNumber, ...row.entry }]
				: [],
		),
		invalid: rows.flatMap((row) =>
			"error" in row && row.error
				? [{ rowNumber: row.rowNumber, reason: row.error }]
				: [],
		),
	};
};

const toDuplicateKey = (entry: {
	title: string;
	url?: string;
	username?: string;
	password: string;
}) =>
	[
		toHostname(entry.url) ?? entry.title.trim().toLowerCase(),
		(entry.username ?? "").trim().toLowerCase(),
		entry.password,
	].join("\u0000");

const buildImportPreview = <
	Candidate extends {
		title: string;
		url?: string;
		username?: string;
		password: string;
	},
>({
	candidates,
	existing,
}: {
	candidates: Candidate[];
	existing: {
		title: string;
		url?: string;
		username?: string;
		password: string;
	}[];
}) => {
	const existingKeys = existing.map(toDuplicateKey);
	const candidateKeys = candidates.map(toDuplicateKey);
	const isDuplicate = (index: number) => {
		const key = candidateKeys[index] ?? "";

		return (
			existingKeys.includes(key) || candidateKeys.indexOf(key) !== index
		);
	};

	return {
		fresh: candidates.filter((_, index) => !isDuplicate(index)),
		duplicates: candidates.filter((_, index) => isDuplicate(index)),
	};
};

const TAG_LIMIT = 20;
const TEXT_LIMIT = 50;
const DEFAULT_CATEGORY_STYLE = { icon: "📁", color: "#6B7280" };

const toCategoryKey = (name: string) =>
	name.trim().slice(0, TEXT_LIMIT).toLowerCase();

const listMissingCategories = ({
	entries,
	categories,
	styles,
}: {
	entries: { categoryName: string | null }[];
	categories: { name: string }[];
	styles: { name: string; icon: string; color: string }[];
}) =>
	entries
		.map((entry) => entry.categoryName?.trim().slice(0, TEXT_LIMIT) ?? "")
		.filter(
			(name, index, all) =>
				!!name &&
				all.findIndex(
					(candidate) =>
						toCategoryKey(candidate) === toCategoryKey(name),
				) === index &&
				!categories.some(
					(category) =>
						toCategoryKey(category.name) === toCategoryKey(name),
				),
		)
		.map((name) => ({
			name,
			...(styles.find(
				(style) => toCategoryKey(style.name) === toCategoryKey(name),
			) ?? DEFAULT_CATEGORY_STYLE),
		}));

const toImportedEntry = <
	Entry extends { categoryName: string | null; tags: string[] },
>({
	entry,
	categories,
}: {
	entry: Entry;
	categories: { id: string; name: string }[];
}) => {
	const { categoryName, tags, ...fields } = entry;
	const categoryKey = toCategoryKey(categoryName ?? "");

	return {
		...fields,
		tags: tags
			.map((tag) => tag.trim().slice(0, TEXT_LIMIT))
			.filter((tag, index, all) => !!tag && all.indexOf(tag) === index)
			.slice(0, TAG_LIMIT),
		categoryId:
			categories.find(
				(category) =>
					categoryKey && toCategoryKey(category.name) === categoryKey,
			)?.id ?? null,
		isCompromised: false,
	};
};

export {
	buildImportPreview,
	detectCsvColumns,
	listMissingCategories,
	parseCsv,
	readCsvImport,
	toImportedEntry,
};
