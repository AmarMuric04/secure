import { secure } from "business-logic-secure";
import { useState } from "react";

import { FormError } from "@/components/shared/FormError";
import { Button, Modal, PasswordInput } from "@/components/ui";

const RestoreBackupForm: React.FC<{
	file: { name: string; text: string };
	onOpened: (
		payload: NonNullable<
			ReturnType<typeof secure.vault.useOpenBackup>["data"]
		>,
	) => void;
	onCancel: () => void;
}> = ({ file, onOpened, onCancel }) => {
	const openBackup = secure.vault.useOpenBackup();

	const [password, setPassword] = useState("");

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		openBackup.mutate(
			{ fileText: file.text, password },
			{ onSettled: () => setPassword(""), onSuccess: onOpened },
		);
	};

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<FormError message={openBackup.error?.message} />

			<p className="truncate rounded-lg bg-muted px-3 py-2 font-mono text-[13px] text-muted-foreground ring-1 ring-border">
				{file.name}
			</p>

			<PasswordInput
				label="Backup password"
				autoComplete="off"
				placeholder="The master password it was made with"
				required
				autoFocus
				disabled={openBackup.isPending}
				value={password}
				onChange={(event) => setPassword(event.target.value)}
			/>

			<div className="flex justify-end gap-2 pt-1">
				<Button
					type="button"
					variant="ghost"
					disabled={openBackup.isPending}
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={!password}
					isLoading={openBackup.isPending}
				>
					Open backup
				</Button>
			</div>
		</form>
	);
};

const RestoreBackupModal: React.FC<{
	file: { name: string; text: string } | null;
	onOpened: React.ComponentProps<typeof RestoreBackupForm>["onOpened"];
	onClose: () => void;
}> = ({ file, onOpened, onClose }) => {
	return (
		<Modal
			isOpen={!!file}
			title="Restore a backup"
			description="Enter the password this backup was locked with"
			onClose={onClose}
		>
			{file && (
				<RestoreBackupForm
					file={file}
					onOpened={onOpened}
					onCancel={onClose}
				/>
			)}
		</Modal>
	);
};

export { RestoreBackupModal };
