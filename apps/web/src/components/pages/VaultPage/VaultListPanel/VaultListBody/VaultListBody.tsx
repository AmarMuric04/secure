import {
	type decryptVault,
	groupEntriesByInitial,
	type secure,
} from "business-logic-secure";
import { Key } from "lucide-react";
import { motion } from "motion/react";

import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Button, Skeleton } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

import { VaultListRow } from "../../VaultListRow";

const SKELETON_ROWS = ["first", "second", "third", "fourth", "fifth", "sixth"];
const STAGGERED_ROW_LIMIT = 14;
const LIST_VARIANTS = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.025 } },
};
const ROW_VARIANTS = {
	hidden: { opacity: 0, y: 6 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3, ease: EASE_OUT },
	},
};

const VaultListBody: React.FC<{
	vault: ReturnType<typeof secure.vault.useVault>;
	listKey: string;
	entries: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	isGrouped: boolean;
	selectedId: string | null;
	hasQuery: boolean;
	onClearSearch: () => void;
}> = ({
	vault,
	listKey,
	entries,
	isGrouped,
	selectedId,
	hasQuery,
	onClearSearch,
}) => {
	const groups = isGrouped
		? groupEntriesByInitial(entries)
		: [{ initial: null, entries }];
	const staggeredIds = entries
		.slice(0, STAGGERED_ROW_LIMIT)
		.map((entry) => entry.id);

	if (vault.isPending) {
		return (
			<div className="space-y-1 px-2.5">
				{SKELETON_ROWS.map((row) => (
					<div
						key={row}
						className="flex items-center gap-3 px-2.5 py-2"
					>
						<Skeleton className="size-9 rounded-[11px]" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-3.5 w-28" />
							<Skeleton className="h-3 w-40" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (vault.isError) {
		return (
			<QueryErrorState
				title="Failed to load vault"
				message={vault.error.message}
				onRetry={() => void vault.refetch()}
			/>
		);
	}

	if (entries.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-subtle">
				<Key className="size-5" />
				{hasQuery ? "Nothing matches your search" : "Nothing here yet"}
				{hasQuery && (
					<Button variant="outline" size="sm" onClick={onClearSearch}>
						Clear search
					</Button>
				)}
			</div>
		);
	}

	return (
		<motion.div
			key={listKey}
			layoutScroll
			variants={LIST_VARIANTS}
			initial="hidden"
			animate="visible"
			className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3"
		>
			{groups.map((group) => (
				<div key={group.initial ?? "all"}>
					{group.initial && (
						<p className="px-2.5 pt-3 pb-1 text-xs font-medium text-subtle">
							{group.initial}
						</p>
					)}
					{group.entries.map((entry) => (
						<motion.div
							key={entry.id}
							variants={
								staggeredIds.includes(entry.id)
									? ROW_VARIANTS
									: undefined
							}
						>
							<VaultListRow
								entry={entry}
								isSelected={entry.id === selectedId}
							/>
						</motion.div>
					))}
				</div>
			))}
		</motion.div>
	);
};

export { VaultListBody };
