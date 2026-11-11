import {
	buildImportPreview,
	type decryptVault,
	secure,
} from "business-logic-secure";
import { FileWarning } from "lucide-react";
import { useState } from "react";

import { FormError } from "@/components/shared/FormError";
import { Button, Checkbox, Modal, useToast } from "@/components/ui";

import { ImportSummary } from "./ImportSummary";

const ImportPreviewForm: React.FC<{
	source: {
		label: string;
		isPlaintextFile: boolean;
		entries: Parameters<
			ReturnType<typeof secure.vault.useImportEntries>["mutate"]
		>[0]["entries"];
		invalid: { rowNumber: number; reason: string }[];
		categoryStyles: { name: string; icon: string; color: string }[];
	};
	vault: Awaited<ReturnType<typeof decryptVault>>;
	onDone: () => void;
}> = ({ source, vault, onDone }) => {
	const importEntries = secure.vault.useImportEntries();
	const { addToast } = useToast();

	const [isIncludingDuplicates, setIsIncludingDuplicates] = useState(false);

	const preview = buildImportPreview({
		candidates: source.entries,
		existing: vault.passwords.filter((entry) => !entry.deletedAt),
	});
	const selected = isIncludingDuplicates ? source.entries : preview.fresh;

	const handleImport = () => {
		importEntries.mutate(
			{
				entries: selected,
				categories: vault.categories,
				categoryStyles: source.categoryStyles,
			},
			{
				onSuccess: ({ createdCount }) => {
					addToast({
						type: "success",
						title: `Imported ${createdCount} password${createdCount === 1 ? "" : "s"}`,
						message: source.isPlaintextFile
							? "Now delete the CSV file. It holds your passwords in plain text."
							: undefined,
					});
					onDone();
				},
			},
		);
	};

	return (
		<div className="space-y-5">
			<FormError message={importEntries.error?.message} />

			<ImportSummary
				freshCount={preview.fresh.length}
				duplicateCount={preview.duplicates.length}
				invalid={source.invalid}
			/>

			{preview.duplicates.length > 0 && (
				<label className="flex cursor-pointer items-center gap-2.5 text-sm">
					<Checkbox
						checked={isIncludingDuplicates}
						onCheckedChange={(checked) =>
							setIsIncludingDuplicates(checked === true)
						}
					/>
					Import the {preview.duplicates.length} duplicates anyway
				</label>
			)}

			{source.isPlaintextFile && (
				<p className="flex gap-2.5 text-[13px] text-muted-foreground">
					<FileWarning className="mt-0.5 size-4 shrink-0 text-warning" />
					This file holds your passwords in plain text. Delete it once
					the import is done, and empty your trash or downloads folder
					too.
				</p>
			)}

			<div className="flex justify-end gap-2 pt-1">
				<Button
					variant="ghost"
					disabled={importEntries.isPending}
					onClick={onDone}
				>
					Cancel
				</Button>
				<Button
					disabled={selected.length === 0}
					isLoading={importEntries.isPending}
					onClick={handleImport}
				>
					Import {selected.length} password
					{selected.length === 1 ? "" : "s"}
				</Button>
			</div>
		</div>
	);
};

const ImportPreviewModal: React.FC<{
	source: React.ComponentProps<typeof ImportPreviewForm>["source"] | null;
	vault: Awaited<ReturnType<typeof decryptVault>> | undefined;
	onClose: () => void;
}> = ({ source, vault, onClose }) => {
	return (
		<Modal
			isOpen={!!source && !!vault}
			title="Review import"
			description={source?.label}
			onClose={onClose}
		>
			{source && vault && (
				<ImportPreviewForm
					source={source}
					vault={vault}
					onDone={onClose}
				/>
			)}
		</Modal>
	);
};

export { ImportPreviewModal };
