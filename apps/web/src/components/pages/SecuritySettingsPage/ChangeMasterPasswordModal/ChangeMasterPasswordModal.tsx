import { readMasterPasswordChangeError, secure } from "business-logic-secure";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";

import { FormError } from "@/components/shared/FormError";
import { Button, Modal, PasswordInput, useToast } from "@/components/ui";

const ChangeMasterPasswordForm: React.FC<{
	isSignInPassword: boolean;
	onDone: () => void;
}> = ({ isSignInPassword, onDone }) => {
	const changeMasterPassword = secure.vault.useChangeMasterPassword();
	const { addToast } = useToast();

	const [currentPassword, setCurrentPassword] = useState("");
	const [nextPassword, setNextPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	const errorMessage = validationError ?? changeMasterPassword.error?.message;
	const stopsWorkingFor = isSignInPassword
		? "for unlocking your vault and for signing in"
		: "for unlocking your vault";

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		const error = readMasterPasswordChangeError({
			currentPassword,
			nextPassword,
			confirmation,
		});

		setValidationError(error);

		if (error) {
			return;
		}

		changeMasterPassword.mutate(
			{ currentPassword, nextPassword },
			{
				onSettled: () => {
					setCurrentPassword("");
					setNextPassword("");
					setConfirmation("");
				},
				onSuccess: ({ revokedSessions }) => {
					addToast({
						type: "success",
						title: "Master password changed",
						message:
							revokedSessions > 0
								? `Signed out ${revokedSessions} other ${revokedSessions === 1 ? "device" : "devices"}.`
								: undefined,
					});
					onDone();
				},
			},
		);
	};

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<div className="flex gap-3 rounded-lg bg-warning-soft px-3.5 py-3 text-[13px] leading-relaxed text-warning">
				<TriangleAlert className="mt-0.5 size-4 shrink-0" />
				<p>
					The old password stops working immediately {stopsWorkingFor}
					, and your other devices are signed out. Nobody can recover
					the new one if you forget it, not even us.
				</p>
			</div>

			<FormError message={errorMessage} />

			<PasswordInput
				label="Current master password"
				autoComplete="current-password"
				disabled={changeMasterPassword.isPending}
				value={currentPassword}
				onChange={(event) => setCurrentPassword(event.target.value)}
			/>
			<PasswordInput
				label="New master password"
				autoComplete="new-password"
				placeholder="At least 12 characters"
				disabled={changeMasterPassword.isPending}
				value={nextPassword}
				onChange={(event) => setNextPassword(event.target.value)}
			/>
			<PasswordInput
				label="Confirm new master password"
				autoComplete="new-password"
				disabled={changeMasterPassword.isPending}
				value={confirmation}
				onChange={(event) => setConfirmation(event.target.value)}
			/>

			<div className="flex justify-end gap-2 pt-1">
				<Button
					type="button"
					variant="ghost"
					disabled={changeMasterPassword.isPending}
					onClick={onDone}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					isLoading={changeMasterPassword.isPending}
				>
					Change master password
				</Button>
			</div>
		</form>
	);
};

const ChangeMasterPasswordModal: React.FC<{
	isOpen: boolean;
	isSignInPassword: boolean;
	onClose: () => void;
}> = ({ isOpen, isSignInPassword, onClose }) => {
	return (
		<Modal
			isOpen={isOpen}
			title="Change master password"
			description="Your entries stay encrypted the whole time. Only the key that unlocks them changes."
			onClose={onClose}
		>
			<ChangeMasterPasswordForm
				isSignInPassword={isSignInPassword}
				onDone={onClose}
			/>
		</Modal>
	);
};

export { ChangeMasterPasswordModal };
