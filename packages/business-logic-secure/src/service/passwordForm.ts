import { parseTotpSecret } from "crypto-service";

import { pushPasswordHistory } from "./passwordHistory";
import type { sealEntry } from "./vaultEntries";

const CUSTOM_FIELD_TYPES = ["text", "password", "hidden"] as const;
const DEFAULT_PASSWORD_OPTIONS = {
	length: 20,
	uppercase: true,
	lowercase: true,
	numbers: true,
	symbols: true,
	excludeAmbiguous: false,
	excludeCharacters: "",
};
const DEFAULT_PASSPHRASE_OPTIONS = {
	wordCount: 4,
	separator: "-",
	capitalize: true,
	includeNumber: true,
};

const createCustomField = () => ({
	key: crypto.randomUUID(),
	name: "",
	value: "",
	type: CUSTOM_FIELD_TYPES[0],
});

const toPasswordFormValues = (entry?: Parameters<typeof sealEntry>[0]) => ({
	title: entry?.title ?? "",
	username: entry?.username ?? "",
	password: entry?.password ?? "",
	url: entry?.url ?? "",
	notes: entry?.notes ?? "",
	totp: entry?.totp ?? "",
	categoryId: entry?.categoryId ?? null,
	tags: entry?.tags ?? [],
	favorite: entry?.favorite ?? false,
	customFields: (entry?.customFields ?? []).map((field) => ({
		...field,
		key: crypto.randomUUID(),
	})),
});

const readPasswordFormError = (
	values: ReturnType<typeof toPasswordFormValues>,
) => {
	if (!values.title.trim()) {
		return "Title is required";
	}

	if (!values.password) {
		return "Password is required";
	}

	if (values.totp.trim() && !parseTotpSecret(values.totp)) {
		return "The 2FA secret must be a base32 key or an otpauth:// link";
	}

	if (
		values.customFields.some(
			(field) => field.value.length > 0 && !field.name.trim(),
		)
	) {
		return "Every custom field needs a name";
	}

	return null;
};

const toPasswordEntryFields = (
	values: ReturnType<typeof toPasswordFormValues>,
) => ({
	title: values.title.trim(),
	username: values.username.trim() || undefined,
	password: values.password,
	url: values.url.trim() || undefined,
	notes: values.notes.trim() ? values.notes : undefined,
	totp: values.totp.trim() || undefined,
	customFields: values.customFields
		.filter((field) => field.name.trim())
		.map(({ name, value, type }) => ({ name: name.trim(), value, type })),
	categoryId: values.categoryId,
	tags: values.tags,
	favorite: values.favorite,
});

const toUpdatedEntry = ({
	entry,
	fields,
	now,
}: {
	entry: Parameters<typeof sealEntry>[0] & { id: string };
	fields: ReturnType<typeof toPasswordEntryFields>;
	now: number;
}) => {
	const isPasswordChanged = entry.password !== fields.password;

	return {
		...entry,
		...fields,
		isCompromised: entry.isCompromised && !isPasswordChanged,
		passwordHistory: isPasswordChanged
			? pushPasswordHistory({
					history: entry.passwordHistory ?? [],
					password: entry.password,
					now,
				})
			: (entry.passwordHistory ?? []),
	};
};

const addTag = ({ tags, tag }: { tags: string[]; tag: string }) => {
	const trimmed = tag.trim();
	const isDuplicate = tags.some(
		(existing) => existing.toLowerCase() === trimmed.toLowerCase(),
	);

	return !trimmed || isDuplicate ? tags : [...tags, trimmed];
};

const hasCharacterSet = (options: typeof DEFAULT_PASSWORD_OPTIONS) =>
	options.uppercase ||
	options.lowercase ||
	options.numbers ||
	options.symbols;

const toWebsiteLink = (url: string | undefined) => {
	if (!url) {
		return null;
	}

	try {
		const parsed = new URL(url.includes("://") ? url : `https://${url}`);

		if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
			return null;
		}

		return { href: parsed.href, hostname: parsed.hostname };
	} catch {
		return null;
	}
};

export {
	addTag,
	createCustomField,
	CUSTOM_FIELD_TYPES,
	DEFAULT_PASSPHRASE_OPTIONS,
	DEFAULT_PASSWORD_OPTIONS,
	hasCharacterSet,
	readPasswordFormError,
	toPasswordEntryFields,
	toPasswordFormValues,
	toUpdatedEntry,
	toWebsiteLink,
};
