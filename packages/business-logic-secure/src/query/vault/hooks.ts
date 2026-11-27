import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createCategory,
	createPasswordEntry,
	deleteCategory,
	deletePasswordEntry,
	restorePasswordEntry,
	updateCategory,
	updatePasswordEntry,
} from "secure-service";

import { readRecoverySalts, recoverEntries } from "../../service/entryRecovery";
import { type decryptVault, sealEntry } from "../../service/vaultEntries";
import {
	createMasterPassword,
	openWithPassword,
} from "../../service/vaultKeys";
import {
	closeVault,
	openVault,
	useIsVaultUnlocked,
	useVaultGeneration,
} from "../../vaultSession";
import { vaultKeysQueryOptions, vaultQueryOptions } from "./queryOptions";

const VAULT_QUERY_KEY = ["vault"];

const useVault = ({ includeDeleted }: { includeDeleted: boolean }) => {
	const generation = useVaultGeneration();
	const isUnlocked = useIsVaultUnlocked();

	return useQuery({
		...vaultQueryOptions({ includeDeleted, generation }),
		enabled: isUnlocked,
	});
};

const useVaultKeys = () => useQuery(vaultKeysQueryOptions());

const useVaultLock = () => {
	const queryClient = useQueryClient();
	const isUnlocked = useIsVaultUnlocked();

	const lock = () => {
		closeVault();
		queryClient.removeQueries({ queryKey: VAULT_QUERY_KEY });
	};

	return { isUnlocked, lock };
};

const useUnlockVault = () =>
	useMutation({
		mutationFn: async (password: string) => {
			openVault(await openWithPassword(password));
		},
	});

const useCreateMasterPassword = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (password: string) => {
			openVault(await createMasterPassword(password));
		},
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: vaultKeysQueryOptions().queryKey,
			}),
	});
};

const useInvalidatingMutation = <Variables, Result>(
	mutationFn: (variables: Variables) => Promise<Result>,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: VAULT_QUERY_KEY }),
	});
};

const useCreatePassword = () =>
	useInvalidatingMutation(async (entry: Parameters<typeof sealEntry>[0]) =>
		createPasswordEntry(await sealEntry(entry)),
	);

const useUpdatePassword = () => {
	const queryClient = useQueryClient();

	return useInvalidatingMutation(
		async (entry: Parameters<typeof sealEntry>[0] & { id: string }) => {
			const previous = queryClient
				.getQueriesData<Awaited<ReturnType<typeof decryptVault>>>({
					queryKey: VAULT_QUERY_KEY,
				})
				.flatMap(([, data]) => data?.passwords ?? [])
				.find((candidate) => candidate.id === entry.id);

			return updatePasswordEntry({
				id: entry.id,
				...(await sealEntry(entry)),
				isPasswordChanged: previous?.password !== entry.password,
			});
		},
	);
};

const useRecoverEntries = () => {
	const queryClient = useQueryClient();

	return useInvalidatingMutation(
		async ({
			password,
			email,
			entries,
		}: {
			password: string;
			email: string;
			entries: Awaited<ReturnType<typeof decryptVault>>["undecryptable"];
		}) => {
			const keys = await queryClient.fetchQuery(vaultKeysQueryOptions());
			const recovered = await recoverEntries({
				password,
				salts: readRecoverySalts({ email, accountSalt: keys.salt }),
				entries,
			});

			await Promise.all(
				recovered.map(async ({ entry, secrets }) =>
					updatePasswordEntry({
						id: entry.id,
						...(await sealEntry({
							...secrets,
							categoryId: entry.categoryId,
							tags: entry.tags,
							favorite: entry.favorite,
							isCompromised: entry.isCompromised,
						})),
						isPasswordChanged: false,
					}),
				),
			);

			return {
				recoveredCount: recovered.length,
				remainingCount: entries.length - recovered.length,
			};
		},
	);
};

const useDeletePassword = () => useInvalidatingMutation(deletePasswordEntry);

const useRestorePassword = () => useInvalidatingMutation(restorePasswordEntry);

const useCreateCategory = () => useInvalidatingMutation(createCategory);

const useUpdateCategory = () => useInvalidatingMutation(updateCategory);

const useDeleteCategory = () => useInvalidatingMutation(deleteCategory);

export {
	useCreateCategory,
	useCreateMasterPassword,
	useCreatePassword,
	useDeleteCategory,
	useDeletePassword,
	useRecoverEntries,
	useRestorePassword,
	useUnlockVault,
	useUpdateCategory,
	useUpdatePassword,
	useVault,
	useVaultKeys,
	useVaultLock,
};
