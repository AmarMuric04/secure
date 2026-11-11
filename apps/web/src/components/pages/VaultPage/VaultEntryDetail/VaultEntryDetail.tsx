import { useNavigate } from "@tanstack/react-router";
import {
	readEntryIssue,
	secure,
	toWebsiteLink,
	type decryptVault,
} from "business-logic-secure";
import { formatDate, formatRelativeTime } from "formatting-service";
import { useState } from "react";

import { VaultStrengthBars } from "@/components/shared/VaultStrengthBars";
import { ConfirmDialog, useToast } from "@/components/ui";

import { EntryHeader } from "./EntryHeader";
import { EntryIssueCallout } from "./EntryIssueCallout";
import { FieldRow } from "./FieldRow";
import { PasswordHistory } from "./PasswordHistory";
import { TotpCodeRow } from "./TotpCodeRow";

const GROUP_CLASS_NAME = "mb-3 rounded-xl bg-muted";

const VaultEntryDetail: React.FC<{
	entry: Awaited<ReturnType<typeof decryptVault>>["passwords"][number];
	categories: Awaited<ReturnType<typeof decryptVault>>["categories"];
}> = ({ entry, categories }) => {
	const navigate = useNavigate();
	const { addToast } = useToast();
	const deletePassword = secure.vault.useDeletePassword();
	const audit = secure.vault.useVaultAudit();
	const markPasswordUsed = secure.vault.useMarkPasswordUsed();

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const issue = readEntryIssue({ audit: audit.data, id: entry.id });
	const websiteLink = toWebsiteLink(entry.url);
	const categoryName =
		categories.find((category) => category.id === entry.categoryId)?.name ??
		null;

	const handleDelete = () => {
		deletePassword.mutate(
			{ id: entry.id, isPermanent: false },
			{
				onSuccess: () => {
					addToast({
						type: "success",
						title: "Moved to trash",
						message: "You can restore it from the trash",
					});
					void navigate({
						to: "/vault",
						search: (previous) => ({
							...previous,
							entry: undefined,
						}),
					});
				},
				onError: () => setIsDeleteOpen(false),
			},
		);
	};

	return (
		<div className="mx-auto w-full max-w-160 px-4 pt-5 pb-10 sm:px-8 md:pt-2">
			<EntryHeader entry={entry} onDelete={() => setIsDeleteOpen(true)} />

			{issue && <EntryIssueCallout entryId={entry.id} issue={issue} />}

			<div className={GROUP_CLASS_NAME}>
				{entry.username && (
					<FieldRow label="Username" value={entry.username} />
				)}
				<FieldRow
					label="Password"
					value={entry.password}
					isSecret
					onCopied={() => markPasswordUsed.mutate(entry.id)}
				>
					<VaultStrengthBars
						strength={entry.passwordStrength}
						className="mt-1.5"
					/>
				</FieldRow>
				{entry.totp && <TotpCodeRow secret={entry.totp} />}
				{entry.customFields?.map((field, index) => (
					<FieldRow
						key={`${index}-${field.name}`}
						label={field.name}
						value={field.value}
						isSecret={field.type !== "text"}
					/>
				))}
			</div>

			<PasswordHistory entry={entry} />

			{(websiteLink || categoryName || entry.tags.length > 0) && (
				<div className={GROUP_CLASS_NAME}>
					{entry.url && (
						<FieldRow
							label="Website"
							value={entry.url}
							href={websiteLink?.href}
						/>
					)}
					{categoryName && (
						<FieldRow
							label="Category"
							value={categoryName}
							isCopyable={false}
						/>
					)}
					{entry.tags.length > 0 && (
						<FieldRow
							label="Tags"
							value={entry.tags.join(", ")}
							isCopyable={false}
						/>
					)}
				</div>
			)}

			{entry.notes && (
				<div className={GROUP_CLASS_NAME}>
					<FieldRow label="Notes" value={entry.notes} isMultiline />
				</div>
			)}

			<p className="flex flex-wrap gap-x-4.5 gap-y-1 px-1 pt-2 text-[12.5px] text-subtle">
				<span>Modified {formatRelativeTime(entry.updatedAt)}</span>
				<span>Created {formatDate(entry.createdAt)}</span>
				{entry.passwordChangedAt && (
					<span>
						Password changed{" "}
						{formatRelativeTime(entry.passwordChangedAt)}
					</span>
				)}
			</p>

			<ConfirmDialog
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={handleDelete}
				title="Move to trash"
				message={`Move "${entry.title}" to trash? You can restore it later.`}
				confirmText="Move to trash"
				isLoading={deletePassword.isPending}
			/>
		</div>
	);
};

export { VaultEntryDetail };
