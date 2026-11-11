import { TRASH_RETENTION_DAYS } from "business-logic-secure";

import { PageHeader } from "@/components/shared/PageHeader";
import { VaultSearchInput } from "@/components/shared/VaultSearchInput";

import { EmptyTrashButton } from "../EmptyTrashButton";

const TrashHeader: React.FC<{
	entryIds: string[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
}> = ({ entryIds, searchQuery, onSearchChange }) => {
	const hasEntries = entryIds.length > 0;

	return (
		<PageHeader
			title="Trash"
			description={`Deleted passwords stay here for ${TRASH_RETENTION_DAYS} days before they are removed for good.`}
			actions={
				hasEntries && (
					<>
						<VaultSearchInput
							value={searchQuery}
							placeholder="Search trash"
							onChange={onSearchChange}
							className="w-56"
						/>
						<EmptyTrashButton entryIds={entryIds} />
					</>
				)
			}
		/>
	);
};

export { TrashHeader };
