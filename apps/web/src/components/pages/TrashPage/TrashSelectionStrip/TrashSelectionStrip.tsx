import { secure } from "business-logic-secure";
import { RotateCcw, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button, ConfirmDialog, useToast } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

const TrashSelectionStrip: React.FC<{
	selectedIds: string[];
	isAllSelected: boolean;
	onSelectAll: () => void;
	onSelectionCleared: () => void;
}> = ({ selectedIds, isAllSelected, onSelectAll, onSelectionCleared }) => {
	const restorePassword = secure.vault.useRestorePassword();
	const deletePassword = secure.vault.useDeletePassword();
	const { addToast } = useToast();

	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	const selectedCount = selectedIds.length;
	const plural = selectedCount === 1 ? "" : "s";

	const restoreSelected = async () => {
		await Promise.allSettled(
			selectedIds.map((id) => restorePassword.mutateAsync(id)),
		);
		onSelectionCleared();
		addToast({
			type: "success",
			title: "Passwords restored",
			message: `Restored ${selectedCount} password${plural} to your vault`,
		});
	};

	const deleteSelected = async () => {
		await Promise.allSettled(
			selectedIds.map((id) =>
				deletePassword.mutateAsync({ id, isPermanent: true }),
			),
		);
		setIsConfirmingDelete(false);
		onSelectionCleared();
		addToast({
			type: "success",
			title: "Passwords deleted",
			message: `Permanently deleted ${selectedCount} password${plural}`,
		});
	};

	const handleRestoreSelected = () => {
		void restoreSelected();
	};

	const handleDeleteSelected = () => {
		void deleteSelected();
	};

	return (
		<>
			<AnimatePresence initial={false}>
				{selectedCount > 0 && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: EASE_OUT }}
						className="overflow-hidden"
					>
						<div className="mb-2 flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-border pb-3">
							<button
								type="button"
								aria-label="Clear selection"
								onClick={onSelectionCleared}
								className="grid size-7 place-items-center rounded-md text-subtle transition-colors hover:bg-accent hover:text-foreground"
							>
								<X className="size-3.5" />
							</button>

							<motion.span
								key={selectedCount}
								initial={{ opacity: 0, y: -4 }}
								animate={{ opacity: 1, y: 0 }}
								className="mr-2 text-sm font-medium tabular-nums"
							>
								{selectedCount} selected
							</motion.span>

							<Button
								variant="ghost"
								size="sm"
								onClick={
									isAllSelected
										? onSelectionCleared
										: onSelectAll
								}
							>
								{isAllSelected ? "Select none" : "Select all"}
							</Button>

							<div className="ml-auto flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleRestoreSelected}
									isLoading={restorePassword.isPending}
								>
									{!restorePassword.isPending && (
										<RotateCcw />
									)}
									Restore
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsConfirmingDelete(true)}
									disabled={deletePassword.isPending}
									className="text-destructive hover:text-destructive"
								>
									<Trash2 />
									Delete forever
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<ConfirmDialog
				isOpen={isConfirmingDelete}
				onClose={() => setIsConfirmingDelete(false)}
				onConfirm={handleDeleteSelected}
				title={`Delete ${selectedCount} password${plural} forever?`}
				message="They will be removed from your vault for good. This cannot be undone."
				confirmText="Delete forever"
				variant="danger"
				isLoading={deletePassword.isPending}
			/>
		</>
	);
};

export { TrashSelectionStrip };
