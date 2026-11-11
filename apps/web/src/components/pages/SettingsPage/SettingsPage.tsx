import { secure } from "business-logic-secure";

import { SettingsPageHeader } from "@/components/shared/SettingsPageHeader";

import { ThemeSelector } from "./ThemeSelector";
import { VaultPreferences } from "./VaultPreferences";

const SettingsPage: React.FC = () => {
	const { data: user } = secure.auth.useSession();

	if (!user) {
		return null;
	}

	return (
		<>
			<SettingsPageHeader
				title="General"
				description="How SecureVault looks and behaves on this account"
			/>

			<div className="space-y-12">
				<ThemeSelector />

				<VaultPreferences settings={user.settings} />
			</div>
		</>
	);
};

export { SettingsPage };
