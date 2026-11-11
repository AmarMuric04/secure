import { secure } from "business-logic-secure";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

import {
	Button,
	ConfirmDialog,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	useToast,
} from "@/components/ui";

const TrashItemActions: React.FC<{ id: string; title: string }> = ({
	id,
	title,
}) => {
	const restorePassword = secure.vault.useRestorePassword();
	const deletePassword = secure.vault.useDeletePassword();
	const { addToast } = useToast();

	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	const handleRestore = () => {
		restorePassword.mutate(id, {
			onSuccess: () =>
				addToast({
					type: "success",
					title: "Password restored",
					message: `${title} is back in your vault`,
				}),
			onError: () =>
				addToast({
					type: "error",
					title: "Restore failed",
					message: "Failed to restore password. Please try again.",
				}),
		});
	};

	const handleDeletePermanently = () => {
		deletePassword.mutate(
			{ id, isPermanent: true },
			{
				onSuccess: () => {
					setIsConfirmingDelete(false);
					addToast({
						type: "success",
						title: "Password deleted",
						message: `${title} was permanently deleted`,
					});
				},
				onError: () =>
					addToast({
						type: "error",
						title: "Delete failed",
						message: "Failed to delete password. Please try again.",
					}),
			},
		);
	};

	return (
		<div className="flex shrink-0 items-center gap-0.5 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0">
			<Button
				variant="ghost"
				size="sm"
				onClick={handleRestore}
				isLoading={restorePassword.isPending}
			>
				{!restorePassword.isPending && <RotateCcw />}
				<span className="max-sm:sr-only">Restore</span>
			</Button>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Delete ${title} forever`}
						onClick={() => setIsConfirmingDelete(true)}
						disabled={deletePassword.isPending}
						className="hover:text-destructive"
					>
						<Trash2 />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Delete forever</TooltipContent>
			</Tooltip>

			<ConfirmDialog
				isOpen={isConfirmingDelete}
				onClose={() => setIsConfirmingDelete(false)}
				onConfirm={handleDeletePermanently}
				title={`Delete ${title} forever?`}
				message="It will be removed from your vault for good. This cannot be undone."
				confirmText="Delete forever"
				variant="danger"
				isLoading={deletePassword.isPending}
			/>
		</div>
	);
};

export { TrashItemActions };
