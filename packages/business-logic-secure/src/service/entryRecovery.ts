import { decryptEntry, deriveLegacyEntryKey } from "crypto-service";

import { secretFieldsSchema } from "./vaultEntries";

const readRecoverySalts = ({
	email,
	accountSalt,
}: {
	email: string;
	accountSalt: string | null;
}) =>
	[email, email.trim().toLowerCase(), accountSalt]
		.filter((salt): salt is string => !!salt)
		.filter((salt, index, all) => all.indexOf(salt) === index);

const tryDecrypt = async ({
	keys,
	encryptedData,
	iv,
}: {
	keys: CryptoKey[];
	encryptedData: string;
	iv: string;
}) => {
	for (const key of keys) {
		try {
			return secretFieldsSchema.parse(
				await decryptEntry({ vaultKey: key, encryptedData, iv }),
			);
		} catch {
			continue;
		}
	}

	return null;
};

const recoverEntries = async <
	Entry extends { id: string; encryptedData: string; iv: string },
>({
	password,
	salts,
	entries,
}: {
	password: string;
	salts: string[];
	entries: Entry[];
}) => {
	const keys = await Promise.all(
		salts.map((salt) => deriveLegacyEntryKey({ password, salt })),
	);
	const attempts = await Promise.all(
		entries.map(async (entry) => ({
			entry,
			secrets: await tryDecrypt({
				keys,
				encryptedData: entry.encryptedData,
				iv: entry.iv,
			}),
		})),
	);

	return attempts.flatMap((attempt) =>
		attempt.secrets
			? [{ entry: attempt.entry, secrets: attempt.secrets }]
			: [],
	);
};

export { readRecoverySalts, recoverEntries };
