import { decryptEntry, encryptEntry } from "crypto-service";
import type { getVault } from "secure-service";
import { z } from "zod";

import { getVaultKey } from "../vaultSession";
import { calculatePasswordStrength } from "./passwordStrength";

const optionalText = z
	.string()
	.nullish()
	.transform((value) => value ?? undefined);

const secretFieldsSchema = z.object({
	title: z.string(),
	username: optionalText,
	password: z.string(),
	url: optionalText,
	notes: optionalText,
	customFields: z
		.array(
			z.object({
				name: z.string(),
				value: z.string(),
				type: z.enum(["text", "password", "hidden"]),
			}),
		)
		.nullish()
		.transform((value) => value ?? undefined),
	totp: optionalText,
	passwordHistory: z
		.array(z.object({ password: z.string(), changedAt: z.string() }))
		.nullish()
		.transform((value) => value ?? []),
});

const decryptVault = async (vault: Awaited<ReturnType<typeof getVault>>) => {
	const vaultKey = getVaultKey();
	const results = await Promise.allSettled(
		vault.passwords.map(async ({ encryptedData, iv, ...metadata }) => {
			const secrets = secretFieldsSchema.parse(
				await decryptEntry({ vaultKey, encryptedData, iv }),
			);

			return {
				...metadata,
				...secrets,
				passwordStrength: calculatePasswordStrength(secrets.password)
					.score,
			};
		}),
	);
	const passwords = results.flatMap((result) =>
		result.status === "fulfilled" ? [result.value] : [],
	);

	if (vault.passwords.length > 0 && passwords.length === 0) {
		throw new Error(
			"None of your entries could be decrypted with this master password",
		);
	}
	const activePasswordCounts = new Map<string, number>();

	for (const entry of passwords) {
		if (!entry.deletedAt && entry.password) {
			activePasswordCounts.set(
				entry.password,
				(activePasswordCounts.get(entry.password) ?? 0) + 1,
			);
		}
	}

	return {
		categories: vault.categories,
		undecryptableCount: vault.passwords.length - passwords.length,
		passwords: passwords.map((entry) => ({
			...entry,
			isReused:
				!entry.deletedAt &&
				(activePasswordCounts.get(entry.password) ?? 0) > 1,
		})),
	};
};

const sealEntry = async (entry: {
	title: string;
	username?: string;
	password: string;
	url?: string;
	notes?: string;
	customFields?: z.infer<typeof secretFieldsSchema>["customFields"];
	totp?: string;
	passwordHistory?: z.infer<typeof secretFieldsSchema>["passwordHistory"];
	categoryId: string | null;
	tags: string[];
	favorite: boolean;
	isCompromised: boolean;
}) => {
	const secrets = secretFieldsSchema.parse(entry);
	const { encryptedData, iv } = await encryptEntry({
		vaultKey: getVaultKey(),
		entry: secrets,
	});

	return {
		encryptedData,
		iv,
		metadata: {
			categoryId: entry.categoryId,
			tags: entry.tags,
			favorite: entry.favorite,
			passwordStrength: calculatePasswordStrength(entry.password).score,
			isCompromised: entry.isCompromised,
			isReused: false,
		},
	};
};

export { decryptVault, sealEntry };
