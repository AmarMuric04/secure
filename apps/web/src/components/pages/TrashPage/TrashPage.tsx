import {
	type decryptVault,
	groupTrashByDeletionDay,
	listTrashedEntries,
	searchVaultEntries,
	secure,
} from "business-logic-secure";
import { useState } from "react";

import { QueryErrorState } from "@/components/shared/QueryErrorState";

import { TrashEmptyState } from "./TrashEmptyState";
import { TrashHeader } from "./TrashHeader";
import { TrashSelectionStrip } from "./TrashSelectionStrip";
import { TrashSkeleton } from "./TrashSkeleton";
import { TrashTimeline } from "./TrashTimeline";

const TrashContent: React.FC<{
	entries: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	searchQuery: string;
}> = ({ entries, searchQuery }) => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const visibleSelectedIds = selectedIds.filter((id) =>
		entries.some((entry) => entry.id === id),
	);
	const isAllSelected =
		entries.length > 0 && visibleSelectedIds.length === entries.length;
	const groups = groupTrashByDeletionDay({ entries, now: Date.now() });

	const handleToggleSelected = (id: string) => {
		setSelectedIds((current) =>
			current.includes(id)
				? current.filter((selectedId) => selectedId !== id)
				: [...current, id],
		);
	};

	if (entries.length === 0) {
		return (
			<p className="py-16 text-center text-sm text-muted-foreground">
				Nothing in the trash matches “{searchQuery}”.
			</p>
		);
	}

	return (
		<>
			<TrashSelectionStrip
				selectedIds={visibleSelectedIds}
				isAllSelected={isAllSelected}
				onSelectAll={() =>
					setSelectedIds(entries.map((entry) => entry.id))
				}
				onSelectionCleared={() => setSelectedIds([])}
			/>

			<TrashTimeline
				groups={groups}
				selectedIds={visibleSelectedIds}
				onToggleSelected={handleToggleSelected}
			/>
		</>
	);
};

const TrashPage: React.FC = () => {
	const vault = secure.vault.useVault({ includeDeleted: true });

	const [searchQuery, setSearchQuery] = useState("");

	const trashedEntries = listTrashedEntries(vault.data?.passwords ?? []);
	const filteredEntries = searchVaultEntries({
		entries: trashedEntries,
		query: searchQuery,
	});

	return (
		<div>
			<TrashHeader
				entryIds={trashedEntries.map((entry) => entry.id)}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>

			{vault.isPending && <TrashSkeleton />}

			{vault.isError && (
				<QueryErrorState
					title="Failed to load trash"
					message={vault.error.message}
					onRetry={() => void vault.refetch()}
				/>
			)}

			{vault.isSuccess && trashedEntries.length === 0 && (
				<TrashEmptyState />
			)}

			{vault.isSuccess && trashedEntries.length > 0 && (
				<TrashContent
					entries={filteredEntries}
					searchQuery={searchQuery}
				/>
			)}
		</div>
	);
};

export { TrashPage };
