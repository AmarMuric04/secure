import { useNavigate } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { Lock, LogOut } from "lucide-react";
import { useState } from "react";

import { SettingsPageHeader } from "@/components/shared/SettingsPageHeader";
import {
	SettingsRow,
	SettingsSection,
} from "@/components/shared/SettingsSection";
import { Button } from "@/components/ui";

import { DeleteAccountModal } from "./DeleteAccountModal";

const AccountSettingsPage: React.FC = () => {
	const navigate = useNavigate();
	const { lock } = secure.vault.useVaultLock();
	const logout = secure.auth.useLogout();

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const handleSignOut = () => {
		logout.mutate(undefined, {
			onSettled: () => navigate({ to: "/login" }),
		});
	};

	return (
		<>
			<SettingsPageHeader
				title="Account"
				description="Your session on this device, and your account itself"
			/>

			<div className="space-y-12">
				<SettingsSection title="Session">
					<SettingsRow
						label="Lock vault"
						description="Forget the decrypted vault and ask for your master password again"
					>
						<Button variant="outline" size="sm" onClick={lock}>
							<Lock />
							Lock now
						</Button>
					</SettingsRow>
					<SettingsRow
						label="Sign out"
						description="End this session on this device"
					>
						<Button
							variant="outline"
							size="sm"
							isLoading={logout.isPending}
							onClick={handleSignOut}
						>
							{!logout.isPending && <LogOut />}
							Sign out
						</Button>
					</SettingsRow>
				</SettingsSection>

				<SettingsSection
					title="Danger zone"
					description="Permanent actions. There is no undo."
				>
					<SettingsRow
						label="Delete account"
						description="Erase your account and every password, category and setting in it"
					>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setIsDeleteModalOpen(true)}
						>
							Delete account
						</Button>
					</SettingsRow>
				</SettingsSection>
			</div>

			<DeleteAccountModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
			/>
		</>
	);
};

export { AccountSettingsPage };
