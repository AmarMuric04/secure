import { useMutation, useQueryClient } from "@tanstack/react-query";
import { openBackup, sealBackup } from "crypto-service";
import { createCategory, createPasswordEntries } from "secure-service";

import {
	buildBackupPayload,
	readBackupEnvelope,
	readBackupPayload,
	toBackupEnvelope,
} from "../../service/vaultBackup";
import { sealEntry } from "../../service/vaultEntries";
import {
	listMissingCategories,
	toImportedEntry,
} from "../../service/vaultImport";
import { openWithPassword } from "../../service/vaultKeys";

const IMPORT_BATCH_SIZE = 100;
const WRONG_BACKUP_PASSWORD_MESSAGE = "That password does not open this backup";

const toBatches = <Item>(items: Item[]) =>
	Array.from(
		{ length: Math.ceil(items.length / IMPORT_BATCH_SIZE) },
		(_, index) =>
			items.slice(
				index * IMPORT_BATCH_SIZE,
				(index + 1) * IMPORT_BATCH_SIZE,
			),
	);

const useImportEntries = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			entries,
			categories,
			categoryStyles,
		}: {
			entries: (Omit<
				Parameters<typeof sealEntry>[0],
				"categoryId" | "isCompromised"
			> & { categoryName: string | null })[];
			categories: { id: string; name: string }[];
			categoryStyles: { name: string; icon: string; color: string }[];
		}) => {
			const createdCategories = await Promise.all(
				listMissingCategories({
					entries,
					categories,
					styles: categoryStyles,
				}).map(async (category) => {
					const created = await createCategory(category);

					return created.category;
				}),
			);
			const allCategories = [...categories, ...createdCategories];
			const sealed = await Promise.all(
				entries.map((entry) =>
					sealEntry(
						toImportedEntry({ entry, categories: allCategories }),
					),
				),
			);
			let createdCount = 0;

			for (const batch of toBatches(sealed)) {
				const result = await createPasswordEntries(batch);

				createdCount += result.createdCount;
			}

			return { createdCount };
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: ["vault"] }),
	});
};

const useExportBackup = () =>
	useMutation({
		mutationFn: async ({
			masterPassword,
			passwords,
			categories,
		}: {
			masterPassword: string;
		} & Parameters<typeof buildBackupPayload>[0]) => {
			await openWithPassword(masterPassword);

			const sealed = await sealBackup({
				password: masterPassword,
				plaintext: JSON.stringify(
					buildBackupPayload({ passwords, categories }),
				),
			});

			return JSON.stringify(toBackupEnvelope(sealed));
		},
	});

const useOpenBackup = () =>
	useMutation({
		mutationFn: async ({
			fileText,
			password,
		}: {
			fileText: string;
			password: string;
		}) => {
			const envelope = readBackupEnvelope(fileText);
			const plaintext = await openBackup({
				password,
				iterations: envelope.kdf.iterations,
				salt: envelope.salt,
				iv: envelope.iv,
				ciphertext: envelope.ciphertext,
			}).catch(() => {
				throw new Error(WRONG_BACKUP_PASSWORD_MESSAGE);
			});

			return readBackupPayload(plaintext);
		},
	});

export { useExportBackup, useImportEntries, useOpenBackup };
