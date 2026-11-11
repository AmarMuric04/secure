import {
	BACKUP_FILE_EXTENSION,
	type decryptVault,
	secure,
	toBackupFileName,
} from "business-logic-secure";
import { useState } from "react";

import { FormError } from "@/components/shared/FormError";
import { Button, Modal, PasswordInput, useToast } from "@/components/ui";
import { downloadTextFile } from "@/lib/downloadTextFile";

const ExportBackupForm: React.FC<{
	vault: Awaited<ReturnType<typeof decryptVault>>;
	onDone: () => void;
}> = ({ vault, onDone }) => {
	const exportBackup = secure.vault.useExportBackup();
	const { addToast } = useToast();

	const [masterPassword, setMasterPassword] = useState("");

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		exportBackup.mutate(
			{
				masterPassword,
				passwords: vault.passwords,
				categories: vault.categories,
			},
			{
				onSettled: () => setMasterPassword(""),
				onSuccess: (fileText) => {
					downloadTextFile({
						fileName: toBackupFileName(Date.now()),
						text: fileText,
						type: "application/json",
					});
					addToast({
						type: "success",
						title: "Backup downloaded",
						message: `Keep the ${BACKUP_FILE_EXTENSION} file somewhere safe.`,
					});
					onDone();
				},
			},
		);
	};

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<FormError message={exportBackup.error?.message} />

			<p className="text-sm text-muted-foreground">
				The file is locked with your current master password. Keep that
				password, because you will need it to restore this backup even
				if you change it later.
			</p>

			<PasswordInput
				label="Master password"
				autoComplete="current-password"
				placeholder="Enter your master password"
				required
				autoFocus
				disabled={exportBackup.isPending}
				value={masterPassword}
				onChange={(event) => setMasterPassword(event.target.value)}
			/>

			<div className="flex justify-end gap-2 pt-1">
				<Button
					type="button"
					variant="ghost"
					disabled={exportBackup.isPending}
					onClick={onDone}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={!masterPassword}
					isLoading={exportBackup.isPending}
				>
					Download backup
				</Button>
			</div>
		</form>
	);
};

const ExportBackupModal: React.FC<{
	vault: Awaited<ReturnType<typeof decryptVault>> | null;
	onClose: () => void;
}> = ({ vault, onClose }) => {
	return (
		<Modal
			isOpen={!!vault}
			title="Download an encrypted backup"
			description="Every password and category, sealed into one file"
			onClose={onClose}
		>
			{vault && <ExportBackupForm vault={vault} onDone={onClose} />}
		</Modal>
	);
};

export { ExportBackupModal };
