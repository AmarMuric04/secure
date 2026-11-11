import { secure } from "business-logic-secure";
import { useState } from "react";

import { CodeInput } from "@/components/shared/CodeInput";
import { FormError } from "@/components/shared/FormError";
import { Button, Modal, PasswordInput } from "@/components/ui";

const DisableMfaForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
	const disableMfa = secure.user.useDisableMfa();

	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		disableMfa.mutate(
			{ password, code },
			{
				onSettled: () => {
					setPassword("");
					setCode("");
				},
				onSuccess: onDone,
			},
		);
	};

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<FormError message={disableMfa.error?.message} />

			<PasswordInput
				label="Master password"
				autoComplete="current-password"
				placeholder="Enter your master password"
				required
				disabled={disableMfa.isPending}
				value={password}
				onChange={(event) => setPassword(event.target.value)}
			/>

			<div className="space-y-2">
				<p className="text-sm font-medium text-foreground">
					Code from your authenticator app
				</p>
				<CodeInput
					value={code}
					isDisabled={disableMfa.isPending}
					onChange={setCode}
				/>
			</div>

			<div className="flex justify-end gap-2 pt-1">
				<Button
					type="button"
					variant="ghost"
					disabled={disableMfa.isPending}
					onClick={onDone}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="destructive"
					disabled={!password || code.length !== 6}
					isLoading={disableMfa.isPending}
				>
					Turn off
				</Button>
			</div>
		</form>
	);
};

const DisableMfaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
	isOpen,
	onClose,
}) => {
	return (
		<Modal
			isOpen={isOpen}
			title="Turn off two-factor authentication"
			description="Confirm it is you. Your backup codes will stop working too."
			onClose={onClose}
		>
			<DisableMfaForm onDone={onClose} />
		</Modal>
	);
};

export { DisableMfaModal };
