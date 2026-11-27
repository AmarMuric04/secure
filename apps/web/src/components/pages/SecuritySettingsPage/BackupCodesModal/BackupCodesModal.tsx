import { AlertTriangle, Download } from "lucide-react";

import { CopyButton } from "@/components/shared/CopyButton";
import { Button, Modal } from "@/components/ui";

const BACKUP_CODES_FILE_NAME = "securevault-backup-codes.txt";

const BackupCodesModal: React.FC<{
	backupCodes: string[] | null;
	onClose: () => void;
}> = ({ backupCodes, onClose }) => {
	const codesText = backupCodes?.join("\n") ?? "";

	const handleDownload = () => {
		const url = URL.createObjectURL(
			new Blob([codesText], { type: "text/plain" }),
		);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = BACKUP_CODES_FILE_NAME;
		anchor.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Modal
			isOpen={backupCodes !== null}
			title="Save your backup codes"
			description="Each code works once if you lose your authenticator"
			onClose={onClose}
		>
			<div className="space-y-4">
				<div className="flex items-start gap-3 rounded-lg bg-warning-soft p-3.5 text-sm">
					<AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
					<p className="text-foreground">
						Store them somewhere safe. They will not be shown again.
					</p>
				</div>

				<div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border font-mono text-sm tracking-wider ring-1 ring-border">
					{backupCodes?.map((code) => (
						<div key={code} className="bg-muted py-2.5 text-center">
							{code}
						</div>
					))}
				</div>

				<div className="flex flex-wrap justify-end gap-2">
					<CopyButton
						value={codesText}
						label="Backup codes"
						variant="outline"
						size="default"
						text="Copy"
					/>
					<Button variant="outline" onClick={handleDownload}>
						<Download />
						Download
					</Button>
					<Button onClick={onClose}>Done</Button>
				</div>
			</div>
		</Modal>
	);
};

export { BackupCodesModal };
