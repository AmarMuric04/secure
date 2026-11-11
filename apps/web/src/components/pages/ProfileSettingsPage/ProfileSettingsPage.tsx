import { secure } from "business-logic-secure";

import { SettingsPageHeader } from "@/components/shared/SettingsPageHeader";

import { ProfileForm } from "./ProfileForm";

const ProfileSettingsPage: React.FC = () => {
	const { data: user } = secure.auth.useSession();

	if (!user) {
		return null;
	}

	return (
		<>
			<SettingsPageHeader
				title="Profile"
				description="How you appear in SecureVault"
			/>

			<ProfileForm
				initialName={user.name ?? ""}
				email={user.email}
				avatarUrl={user.avatarUrl ?? null}
			/>
		</>
	);
};

export { ProfileSettingsPage };
