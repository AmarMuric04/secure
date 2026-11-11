import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSalt, createVaultKey, deriveMasterKeys } from "crypto-service";
import {
	confirmRegistration,
	getSalt,
	login,
	logout,
	register,
	verifyMfa,
} from "secure-service";

import { openWithMasterKeys } from "../../service/vaultKeys";
import {
	closeVault,
	deferUnlock,
	openVault,
	runDeferredUnlock,
} from "../../vaultSession";
import { sessionQueryOptions } from "./queryOptions";

const useSession = () => useQuery(sessionQueryOptions());

const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			email,
			password,
		}: {
			email: string;
			password: string;
		}) => {
			const { salt } = await getSalt(email);
			const masterKeys = await deriveMasterKeys({ password, salt });
			const result = await login({
				email,
				authHash: masterKeys.authHash,
			});

			if (result.status === "mfa") {
				deferUnlock(() => openWithMasterKeys(masterKeys));

				return result;
			}

			openVault(await openWithMasterKeys(masterKeys));

			return result;
		},
		onSuccess: (result) => {
			if (result.status === "authenticated") {
				queryClient.setQueryData(
					sessionQueryOptions().queryKey,
					result.user,
				);
			}
		},
	});
};

const useVerifyMfa = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (verification: Parameters<typeof verifyMfa>[0]) => {
			const { user } = await verifyMfa(verification);

			await runDeferredUnlock().catch(() => null);

			return user;
		},
		onSuccess: (user) => {
			queryClient.setQueryData(sessionQueryOptions().queryKey, user);
		},
	});
};

const useRegister = () =>
	useMutation({
		mutationFn: async ({
			email,
			name,
			password,
		}: {
			email: string;
			name?: string;
			password: string;
		}) => {
			const salt = createSalt();
			const { authHash, wrappingKey } = await deriveMasterKeys({
				password,
				salt,
			});
			const { vaultKey, encryptedVaultKey } =
				await createVaultKey(wrappingKey);
			const { token } = await register({
				email,
				name,
				authHash,
				salt,
				encryptedVaultKey,
			});

			deferUnlock(async () => vaultKey);

			return { token, email };
		},
	});

const useConfirmRegistration = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (confirmation: { token: string; code: string }) => {
			const { user } = await confirmRegistration(confirmation);

			await runDeferredUnlock();

			return user;
		},
		onSuccess: (user) => {
			queryClient.setQueryData(sessionQueryOptions().queryKey, user);
		},
	});
};

const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logout,
		onSettled: () => {
			closeVault();
			queryClient.clear();
			queryClient.setQueryData(sessionQueryOptions().queryKey, null);
		},
	});
};

export {
	useConfirmRegistration,
	useLogin,
	useLogout,
	useRegister,
	useSession,
	useVerifyMfa,
};
