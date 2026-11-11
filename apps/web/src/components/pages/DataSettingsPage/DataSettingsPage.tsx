import {
	BACKUP_FILE_EXTENSION,
	readCsvImport,
	secure,
} from "business-logic-secure";
import { Download, FileArchive, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

import { SettingsPageHeader } from "@/components/shared/SettingsPageHeader";
import {
	SettingsRow,
	SettingsSection,
} from "@/components/shared/SettingsSection";
import { Button, useToast } from "@/components/ui";

import { ExportBackupModal } from "./ExportBackupModal";
import { FilePickerButton } from "./FilePickerButton";
import { ImportPreviewModal } from "./ImportPreviewModal";
import { RestoreBackupModal } from "./RestoreBackupModal";

const DataSettingsPage: React.FC = () => {
	const vault = secure.vault.useVault({ includeDeleted: false });
	const { addToast } = useToast();

	const [importSource, setImportSource] =
		useState<React.ComponentProps<typeof ImportPreviewModal>["source"]>(
			null,
		);
	const [backupFile, setBackupFile] = useState<{
		name: string;
		text: string;
	} | null>(null);
	const [isExportOpen, setIsExportOpen] = useState(false);

	const isVaultReady = !!vault.data;

	const handleCsvFile = async (file: File) => {
		try {
			const { format, candidates, invalid } = readCsvImport(
				await file.text(),
			);

			setImportSource({
				label: `${format} export · ${file.name}`,
				isPlaintextFile: true,
				entries: candidates,
				invalid,
				categoryStyles: [],
			});
		} catch (error) {
			addToast({
				type: "error",
				title: "Could not read that file",
				message: error instanceof Error ? error.message : undefined,
			});
		}
	};

	const handleBackupFile = async (file: File) => {
		setBackupFile({ name: file.name, text: await file.text() });
	};

	const handleBackupOpened = (
		payload: NonNullable<
			ReturnType<typeof secure.vault.useOpenBackup>["data"]
		>,
	) => {
		setImportSource({
			label: `SecureVault backup · ${backupFile?.name ?? ""}`,
			isPlaintextFile: false,
			entries: payload.entries,
			invalid: [],
			categoryStyles: payload.categories,
		});
		setBackupFile(null);
	};

	return (
		<>
			<SettingsPageHeader
				title="Import & export"
				description="Bring passwords in from another manager, or keep an encrypted copy of your vault"
			/>

			<div className="space-y-12">
				<SettingsSection
					title="Import"
					description="Everything is read and encrypted on this device before it is saved"
				>
					<SettingsRow
						label="From another password manager"
						description="A CSV export from Chrome, Edge, Firefox, Bitwarden or 1Password, or any file with name, url, username and password columns"
					>
						<FilePickerButton
							label="Choose CSV"
							accept=".csv,text/csv"
							icon={<FileSpreadsheet />}
							isDisabled={!isVaultReady}
							onFile={(file) => void handleCsvFile(file)}
						/>
					</SettingsRow>
					<SettingsRow
						label="From a SecureVault backup"
						description={`A ${BACKUP_FILE_EXTENSION} file you downloaded earlier`}
					>
						<FilePickerButton
							label="Choose backup"
							accept={`${BACKUP_FILE_EXTENSION},application/json`}
							icon={<FileArchive />}
							isDisabled={!isVaultReady}
							onFile={(file) => void handleBackupFile(file)}
						/>
					</SettingsRow>
				</SettingsSection>

				<SettingsSection
					title="Backup"
					description="There is no plain-text export, so your passwords never sit unprotected on disk"
				>
					<SettingsRow
						label="Encrypted backup"
						description="One file with every password and category, locked with your master password"
					>
						<Button
							variant="outline"
							size="sm"
							disabled={!isVaultReady}
							onClick={() => setIsExportOpen(true)}
						>
							<Download />
							Download
						</Button>
					</SettingsRow>
				</SettingsSection>
			</div>

			<ImportPreviewModal
				source={importSource}
				vault={vault.data}
				onClose={() => setImportSource(null)}
			/>
			<RestoreBackupModal
				file={backupFile}
				onOpened={handleBackupOpened}
				onClose={() => setBackupFile(null)}
			/>
			<ExportBackupModal
				vault={isExportOpen ? (vault.data ?? null) : null}
				onClose={() => setIsExportOpen(false)}
			/>
		</>
	);
};

export { DataSettingsPage };
