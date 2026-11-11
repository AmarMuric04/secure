import { useNavigate } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { FormError } from "@/components/shared/FormError";
import { Button, Input, Modal, PasswordInput } from "@/components/ui";

const CONFIRMATION_WORD = "DELETE";

const DeleteAccountForm: React.FC<{ onCancel: () => void }> = ({
	onCancel,
}) => {
	const navigate = useNavigate();
	const deleteAccount = secure.user.useDeleteAccount();

	const [confirmation, setConfirmation] = useState("");
	const [password, setPassword] = useState("");

	const isConfirmed = confirmation === CONFIRMATION_WORD && password !== "";

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		deleteAccount.mutate(password, {
			onSettled: () => setPassword(""),
			onSuccess: () => navigate({ to: "/" }),
		});
	};

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<p className="flex items-start gap-2.5 text-sm text-muted-foreground">
				<AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
				Every password, category and setting is erased for good. There
				is no backup and no undo.
			</p>

			<FormError message={deleteAccount.error?.message} />

			<PasswordInput
				label="Master password"
				autoComplete="current-password"
				placeholder="Enter your master password"
				required
				disabled={deleteAccount.isPending}
				value={password}
				onChange={(event) => setPassword(event.target.value)}
			/>

			<div className="space-y-1.5">
				<label
					htmlFor="delete-account-confirmation"
					className="text-sm font-medium text-foreground"
				>
					Type{" "}
					<span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] ring-1 ring-border">
						{CONFIRMATION_WORD}
					</span>{" "}
					to confirm
				</label>
				<Input
					id="delete-account-confirmation"
					autoComplete="off"
					placeholder={CONFIRMATION_WORD}
					className="font-mono"
					disabled={deleteAccount.isPending}
					value={confirmation}
					onChange={(event) => setConfirmation(event.target.value)}
				/>
			</div>

			<div className="flex justify-end gap-2 pt-1">
				<Button
					type="button"
					variant="ghost"
					disabled={deleteAccount.isPending}
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="destructive"
					disabled={!isConfirmed}
					isLoading={deleteAccount.isPending}
				>
					Delete account
				</Button>
			</div>
		</form>
	);
};

const DeleteAccountModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
}> = ({ isOpen, onClose }) => {
	return (
		<Modal
			isOpen={isOpen}
			title="Delete account"
			description="Confirm with your master password"
			onClose={onClose}
		>
			<DeleteAccountForm onCancel={onClose} />
		</Modal>
	);
};

export { DeleteAccountModal };
