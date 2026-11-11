import { secure } from "business-logic-secure";
import { useEffect, useRef, useState } from "react";

import { CombinationDial } from "@/components/shared/CombinationDial";
import { cn } from "@/lib/utils";

import { MasterPasswordField } from "../MasterPasswordField";

const MIN_MASTER_PASSWORD_LENGTH = 12;

const readSetupError = ({
	password,
	confirmation,
}: {
	password: string;
	confirmation: string;
}) => {
	if (password.length < MIN_MASTER_PASSWORD_LENGTH) {
		return `Use at least ${MIN_MASTER_PASSWORD_LENGTH} characters`;
	}

	if (password !== confirmation) {
		return "Master passwords do not match";
	}

	return null;
};

const UnlockForm: React.FC<{
	isSetup: boolean;
	isUnlocked: boolean;
	email: string;
	loadError: string | null;
	onOpened: (point: { x: number; y: number }) => void;
}> = ({ isSetup, isUnlocked, email, loadError, onOpened }) => {
	const unlockVault = secure.vault.useUnlockVault();
	const createMasterPassword = secure.vault.useCreateMasterPassword();

	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isCapsLockOn, setIsCapsLockOn] = useState(false);
	const dialRef = useRef<HTMLDivElement>(null);

	const mutation = isSetup ? createMasterPassword : unlockVault;
	const visibleError = errorMessage ?? loadError;
	const dialStatus = visibleError ? "error" : "idle";
	const hint = isCapsLockOn ? "Caps Lock is on" : "";

	useEffect(() => {
		if (!isUnlocked || !dialRef.current) {
			return;
		}

		const bounds = dialRef.current.getBoundingClientRect();

		onOpened({
			x: bounds.left + bounds.width / 2,
			y: bounds.top + bounds.height / 2,
		});
	}, [isUnlocked]);

	const handlePasswordChange = (value: string) => {
		setPassword(value);
		setErrorMessage(null);
	};

	const handleConfirmationChange = (value: string) => {
		setConfirmation(value);
		setErrorMessage(null);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (!password) {
			setErrorMessage("Enter your master password");

			return;
		}

		const setupError = isSetup
			? readSetupError({ password, confirmation })
			: null;

		if (setupError) {
			setErrorMessage(setupError);

			return;
		}

		mutation.mutate(password, {
			onError: (error) => {
				setErrorMessage(error.message);
				setPassword("");
			},
		});
	};

	return (
		<form
			className="flex w-full flex-col items-center"
			onSubmit={handleSubmit}
		>
			<div ref={dialRef} className="mb-9">
				<CombinationDial
					length={password.length}
					status={isUnlocked ? "open" : dialStatus}
				/>
			</div>

			<h1 className="text-3xl font-semibold tracking-tight">
				{isSetup ? "Set your master password" : "Vault locked"}
			</h1>
			<p className="mt-2 text-muted-foreground">
				{isSetup
					? "It encrypts your vault on this device and is separate from your sign-in."
					: "Enter your master password to continue."}
			</p>

			<span className="mt-5 inline-flex max-w-full items-center gap-2 truncate rounded-full bg-muted py-1 pr-3 pl-1 text-sm text-muted-foreground ring-1 ring-border">
				<span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-semibold">
					{email.charAt(0).toUpperCase()}
				</span>
				{email}
			</span>

			<div className="mt-7 flex w-full flex-col gap-3">
				<MasterPasswordField
					value={password}
					label="Master password"
					autoComplete={isSetup ? "new-password" : "current-password"}
					isInvalid={!!visibleError}
					isDisabled={mutation.isPending || isUnlocked}
					autoFocus
					submit={
						isSetup ? undefined : { isBusy: mutation.isPending }
					}
					onChange={handlePasswordChange}
					onCapsLockChange={setIsCapsLockOn}
				/>

				{isSetup && (
					<MasterPasswordField
						value={confirmation}
						label="Confirm master password"
						autoComplete="new-password"
						isInvalid={!!visibleError}
						isDisabled={mutation.isPending || isUnlocked}
						submit={{ isBusy: mutation.isPending }}
						onChange={handleConfirmationChange}
						onCapsLockChange={setIsCapsLockOn}
					/>
				)}
			</div>

			<p
				key={visibleError ?? hint}
				aria-live="polite"
				className={cn(
					"mt-3 min-h-5 text-sm motion-safe:animate-[hint-in_0.25s_var(--ease-out-quint)]",
					visibleError ? "text-destructive" : "text-subtle",
				)}
			>
				{visibleError ?? hint}
			</p>

			{isSetup && (
				<p className="mt-2 text-xs text-subtle">
					We never see your master password. If you forget it, your
					stored passwords cannot be recovered.
				</p>
			)}
		</form>
	);
};

export { UnlockForm };
