import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteAccount,
	disableMfa,
	enableMfa,
	updateProfile,
} from "secure-service";

import { deriveAuthHash } from "../../service/vaultKeys";
import { closeVault } from "../../vaultSession";
import { sessionQueryOptions } from "../auth/queryOptions";
import { mfaSetupQueryOptions } from "./queryOptions";

const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateProfile,
		onSuccess: ({ user }) => {
			queryClient.setQueryData(sessionQueryOptions().queryKey, user);
		},
	});
};

const useDeleteAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (password: string) =>
			deleteAccount(await deriveAuthHash(password)),
		onSuccess: () => {
			closeVault();
			queryClient.clear();
			queryClient.setQueryData(sessionQueryOptions().queryKey, null);
		},
	});
};

const useMfaSetup = ({ enabled }: { enabled: boolean }) =>
	useQuery({ ...mfaSetupQueryOptions(), enabled });

const useEnableMfa = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: enableMfa,
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: sessionQueryOptions().queryKey,
			}),
	});
};

const useDisableMfa = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			password,
			code,
		}: {
			password: string;
			code: string;
		}) => disableMfa({ authHash: await deriveAuthHash(password), code }),
		onSuccess: ({ user }) => {
			queryClient.setQueryData(sessionQueryOptions().queryKey, user);
		},
	});
};

export {
	useDeleteAccount,
	useDisableMfa,
	useEnableMfa,
	useMfaSetup,
	useUpdateProfile,
};
