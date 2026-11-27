import { type decryptVault, secure } from "business-logic-secure";
import { useState } from "react";

import { FormError } from "@/components/shared/FormError";
import { Button, Modal, PasswordInput, useToast } from "@/components/ui";

const RecoverEntriesForm: React.FC<{
	entries: Awaited<ReturnType<typeof decryptVault>>["undecryptable"];
	onDone: () => void;
}> = ({ entries, onDone }) => {
	const { data: user } = secure.auth.useSession();
	const recoverEntries = secure.vault.useRecoverEntries();
	const { addToast } = useToast();

	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handlePasswordChange = (value: string) => {
		setPassword(value);
		setErrorMessage(null);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (!user || !password) {
			return;
		}

		setErrorMessage(null);
		recoverEntries.mutate(
			{ password, email: user.email, entries },
			{
				onSuccess: ({ recoveredCount, remainingCount }) => {
					if (recoveredCount === 0) {
						setErrorMessage(
							"That password did not unlock any of them. Try a master password you used before.",
						);

						return;
					}

					addToast({
						type: "success",
						title: `Recovered ${recoveredCount} ${recoveredCount === 1 ? "entry" : "entries"}`,
						message:
							remainingCount > 0
								? `${remainingCount} still locked. Try another old password.`
								: undefined,
					});
					onDone();
				},
				onError: (error) => setErrorMessage(error.message),
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<PasswordInput
				label="Master password"
				autoComplete="current-password"
				placeholder="Current or a previous master password"
				autoFocus
				disabled={recoverEntries.isPending}
				value={password}
				onChange={(event) => handlePasswordChange(event.target.value)}
			/>

			{errorMessage && <FormError message={errorMessage} />}

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					disabled={recoverEntries.isPending}
					onClick={onDone}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					isLoading={recoverEntries.isPending}
					disabled={!password}
				>
					Recover
				</Button>
			</div>
		</form>
	);
};

const RecoverEntriesModal: React.FC<{
	isOpen: boolean;
	entries: Awaited<ReturnType<typeof decryptVault>>["undecryptable"];
	onClose: () => void;
}> = ({ isOpen, entries, onClose }) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Recover hidden entries"
			description="An older version of the app sometimes encrypted entries with a key based on your email. Enter your master password and we will try those keys here on your device, then re-save anything we can open under your current key."
		>
			<RecoverEntriesForm entries={entries} onDone={onClose} />
		</Modal>
	);
};

export { RecoverEntriesModal };
