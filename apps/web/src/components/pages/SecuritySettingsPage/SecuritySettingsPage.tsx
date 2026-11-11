import { secure } from "business-logic-secure";
import { useState } from "react";

import { SettingsPageHeader } from "@/components/shared/SettingsPageHeader";
import {
	SettingsRow,
	SettingsSection,
} from "@/components/shared/SettingsSection";
import { Button } from "@/components/ui";

import { ActiveSessions } from "./ActiveSessions";
import { BackupCodesModal } from "./BackupCodesModal";
import { ChangeMasterPasswordModal } from "./ChangeMasterPasswordModal";
import { DisableMfaModal } from "./DisableMfaModal";
import { MfaSetupModal } from "./MfaSetupModal";
import { MfaStatus } from "./MfaStatus";

const SecuritySettingsPage: React.FC = () => {
	const { data: user } = secure.auth.useSession();

	const [openModal, setOpenModal] = useState<
		"setup" | "disable" | "masterPassword" | null
	>(null);
	const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

	const handleMfaEnabled = (codes: string[]) => {
		setOpenModal(null);
		setBackupCodes(codes);
	};

	if (!user) {
		return null;
	}

	return (
		<>
			<SettingsPageHeader
				title="Security"
				description="How your account and your vault are protected"
			/>

			<div className="space-y-12">
				<SettingsSection
					title="Two-factor authentication"
					description="A second step that protects your account if your sign-in leaks"
				>
					<MfaStatus
						isEnabled={user.mfaEnabled}
						onEnable={() => setOpenModal("setup")}
						onDisable={() => setOpenModal("disable")}
					/>
				</SettingsSection>

				<SettingsSection
					title="Encryption"
					description="What keeps your passwords private, even from us"
				>
					<SettingsRow
						label="Master password"
						description={
							user.authProvider === "credentials"
								? "Signs you in and unlocks your vault. It never leaves this device and cannot be reset."
								: "Unlocks your vault. It never leaves this device and cannot be reset."
						}
					>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setOpenModal("masterPassword")}
						>
							Change
						</Button>
					</SettingsRow>
					<SettingsRow
						label="Vault encryption"
						description="Every entry is sealed with AES-256-GCM before upload. The key is derived on this device."
					/>
					<SettingsRow
						label="Auto-lock"
						description={`The vault locks after ${user.settings.autoLockMinutes} ${user.settings.autoLockMinutes === 1 ? "minute" : "minutes"} of inactivity. Change it in General.`}
					/>
				</SettingsSection>

				<ActiveSessions />
			</div>

			<ChangeMasterPasswordModal
				isOpen={openModal === "masterPassword"}
				isSignInPassword={user.authProvider === "credentials"}
				onClose={() => setOpenModal(null)}
			/>

			<MfaSetupModal
				isOpen={openModal === "setup"}
				onClose={() => setOpenModal(null)}
				onEnabled={handleMfaEnabled}
			/>

			<DisableMfaModal
				isOpen={openModal === "disable"}
				onClose={() => setOpenModal(null)}
			/>

			<BackupCodesModal
				backupCodes={backupCodes}
				onClose={() => setBackupCodes(null)}
			/>
		</>
	);
};

export { SecuritySettingsPage };
