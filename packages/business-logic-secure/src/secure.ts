import {
	useConfirmRegistration,
	useLogin,
	useLogout,
	useRegister,
	useSession,
	useVerifyMfa,
} from "./query/auth";
import { useMarkPasswordUsed, useVaultAudit } from "./query/audit";
import { useCheckBreaches } from "./query/breach";
import { useChangeMasterPassword } from "./query/masterPassword";
import {
	useActiveSessions,
	useRevokeOtherSessions,
	useRevokeSession,
} from "./query/sessions";
import {
	useExportBackup,
	useImportEntries,
	useOpenBackup,
} from "./query/transfer";
import {
	useDeleteAccount,
	useDisableMfa,
	useEnableMfa,
	useMfaSetup,
	useUpdateProfile,
} from "./query/user";
import {
	useCreateCategory,
	useCreateMasterPassword,
	useCreatePassword,
	useDeleteCategory,
	useDeletePassword,
	useRestorePassword,
	useUnlockVault,
	useUpdateCategory,
	useUpdatePassword,
	useVault,
	useVaultKeys,
	useVaultLock,
} from "./query/vault";

const secure = {
	auth: {
		useSession,
		useLogin,
		useVerifyMfa,
		useRegister,
		useConfirmRegistration,
		useLogout,
		useActiveSessions,
		useRevokeSession,
		useRevokeOtherSessions,
	},
	vault: {
		useVault,
		useVaultKeys,
		useVaultLock,
		useCheckBreaches,
		useVaultAudit,
		useMarkPasswordUsed,
		useUnlockVault,
		useCreateMasterPassword,
		useChangeMasterPassword,
		useCreatePassword,
		useUpdatePassword,
		useDeletePassword,
		useRestorePassword,
		useCreateCategory,
		useUpdateCategory,
		useDeleteCategory,
		useImportEntries,
		useExportBackup,
		useOpenBackup,
	},
	user: {
		useUpdateProfile,
		useDeleteAccount,
		useMfaSetup,
		useEnableMfa,
		useDisableMfa,
	},
};

export { secure };
