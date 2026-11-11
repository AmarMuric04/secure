import {
	formatMaxAgeOption,
	PASSWORD_MAX_AGE_OPTIONS,
	secure,
} from "business-logic-secure";

import { SettingsSection } from "@/components/shared/SettingsSection";
import { useToast } from "@/components/ui";

import { PreferenceSelect } from "./PreferenceSelect";
import { PreferenceSwitch } from "./PreferenceSwitch";

const AUTO_LOCK_OPTIONS = [
	{ value: "1", label: "1 minute" },
	{ value: "5", label: "5 minutes" },
	{ value: "15", label: "15 minutes" },
	{ value: "30", label: "30 minutes" },
	{ value: "60", label: "1 hour" },
];

const CLEAR_CLIPBOARD_OPTIONS = [
	{ value: "30", label: "30 seconds" },
	{ value: "60", label: "60 seconds" },
	{ value: "90", label: "90 seconds" },
	{ value: "120", label: "2 minutes" },
];

const MAX_AGE_OPTIONS = PASSWORD_MAX_AGE_OPTIONS.map((days) => ({
	value: String(days),
	label: formatMaxAgeOption(days),
}));

const SORT_OPTIONS = [
	{ value: "name", label: "Name" },
	{ value: "updated", label: "Last updated" },
	{ value: "created", label: "Date created" },
] as const;

const VaultPreferences: React.FC<{
	settings: NonNullable<
		ReturnType<typeof secure.auth.useSession>["data"]
	>["settings"];
}> = ({ settings }) => {
	const updateProfile = secure.user.useUpdateProfile();
	const { addToast } = useToast();

	const handleSave = (changes: Partial<typeof settings>) => {
		updateProfile.mutate(
			{ settings: changes },
			{
				onError: (error) =>
					addToast({
						type: "error",
						title: "Preferences not saved",
						message: error.message,
					}),
			},
		);
	};

	const handleSortChange = (value: string) => {
		const option = SORT_OPTIONS.find((sort) => sort.value === value);

		if (option) {
			handleSave({ defaultSort: option.value });
		}
	};

	return (
		<div className="space-y-12">
			<SettingsSection
				title="Protection"
				description="How long secrets stay exposed"
			>
				<PreferenceSelect
					label="Auto-lock"
					description="Lock the vault after this much inactivity"
					value={String(settings.autoLockMinutes)}
					options={AUTO_LOCK_OPTIONS}
					isDisabled={updateProfile.isPending}
					onChange={(value) =>
						handleSave({ autoLockMinutes: Number(value) })
					}
				/>
				<PreferenceSelect
					label="Clear clipboard"
					description="Wipe copied secrets after this long"
					value={String(settings.clearClipboardSeconds)}
					options={CLEAR_CLIPBOARD_OPTIONS}
					isDisabled={updateProfile.isPending}
					onChange={(value) =>
						handleSave({ clearClipboardSeconds: Number(value) })
					}
				/>
				<PreferenceSelect
					label="Password reminders"
					description="Flag passwords that have not been changed for this long"
					value={String(settings.passwordMaxAgeDays)}
					options={MAX_AGE_OPTIONS}
					isDisabled={updateProfile.isPending}
					onChange={(value) =>
						handleSave({ passwordMaxAgeDays: Number(value) })
					}
				/>
			</SettingsSection>

			<SettingsSection
				title="Vault"
				description="How your passwords are shown"
			>
				<PreferenceSelect
					label="Default sort"
					description="Order of entries in your vault list"
					value={settings.defaultSort}
					options={SORT_OPTIONS}
					isDisabled={updateProfile.isPending}
					onChange={handleSortChange}
				/>
				<PreferenceSwitch
					label="Password strength"
					description="Show strength bars next to your passwords"
					isChecked={settings.showPasswordStrength}
					isDisabled={updateProfile.isPending}
					onChange={(isChecked) =>
						handleSave({ showPasswordStrength: isChecked })
					}
				/>
				<PreferenceSwitch
					label="Website icons"
					description="Fetched from Google, which then sees the sites you have saved"
					isChecked={settings.showFavicons}
					isDisabled={updateProfile.isPending}
					onChange={(isChecked) =>
						handleSave({ showFavicons: isChecked })
					}
				/>
			</SettingsSection>
		</div>
	);
};

export { VaultPreferences };
