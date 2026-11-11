import { secure } from "business-logic-secure";
import { AnimatePresence, motion } from "motion/react";

import { useIsMobile } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/vault/index";

import { VaultDetailEmpty } from "./VaultDetailEmpty";
import { VaultEntryDetail } from "./VaultEntryDetail";
import { VaultListPanel } from "./VaultListPanel";
import { VaultSplitView } from "./VaultSplitView";

const VaultPage: React.FC = () => {
	const { category, filter, entry: selectedId } = Route.useSearch();
	const vault = secure.vault.useVault({ includeDeleted: false });
	const isMobile = useIsMobile();

	const selectedEntry = vault.data?.passwords.find(
		(password) => password.id === selectedId,
	);

	const renderList = (headerActions: React.ReactNode) => (
		<VaultListPanel
			vault={vault}
			categoryId={category ?? null}
			isFavoritesOnly={filter === "favorites"}
			selectedId={selectedId ?? null}
			headerActions={headerActions}
		/>
	);

	const detail = (
		<AnimatePresence initial={false} mode="wait">
			<motion.div
				key={selectedEntry?.id ?? "empty"}
				initial={{ opacity: 0, x: 12 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, transition: { duration: 0.08 } }}
				transition={{ duration: 0.3, ease: EASE_OUT }}
				className="flex min-h-full flex-col"
			>
				{selectedEntry && vault.data ? (
					<VaultEntryDetail
						entry={selectedEntry}
						categories={vault.data.categories}
					/>
				) : (
					<VaultDetailEmpty isPending={vault.isPending} />
				)}
			</motion.div>
		</AnimatePresence>
	);

	if (isMobile) {
		return (
			<div className="flex min-h-0 flex-1 flex-col">
				<section
					className={cn(
						"flex min-h-0 flex-1 flex-col overflow-hidden",
						selectedId && "hidden",
					)}
				>
					{renderList(null)}
				</section>

				<section
					className={cn(
						"relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto",
						!selectedId && "hidden",
					)}
				>
					{detail}
				</section>
			</div>
		);
	}

	return (
		<VaultSplitView
			selectedId={selectedId ?? null}
			renderList={renderList}
			detail={detail}
		/>
	);
};

export { VaultPage };
