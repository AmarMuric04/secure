import { secure } from "business-logic-secure";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button, ConfirmDialog, useToast } from "@/components/ui";

const EmptyTrashButton: React.FC<{ entryIds: string[] }> = ({ entryIds }) => {
	const deletePassword = secure.vault.useDeletePassword();
	const { addToast } = useToast();

	const [isOpen, setIsOpen] = useState(false);

	const count = entryIds.length;

	const deleteAll = async () => {
		await Promise.allSettled(
			entryIds.map((id) =>
				deletePassword.mutateAsync({ id, isPermanent: true }),
			),
		);
		setIsOpen(false);
		addToast({
			type: "success",
			title: "Trash emptied",
			message: `Permanently deleted ${count} password${count === 1 ? "" : "s"}`,
		});
	};

	const handleConfirm = () => {
		void deleteAll();
	};

	return (
		<>
			<Button
				variant="ghost"
				onClick={() => setIsOpen(true)}
				disabled={deletePassword.isPending}
				className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
			>
				<Trash2 />
				Empty trash
			</Button>

			<ConfirmDialog
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				onConfirm={handleConfirm}
				title="Empty trash?"
				message={`All ${count} password${count === 1 ? "" : "s"} in the trash will be permanently deleted. This cannot be undone.`}
				confirmText="Delete forever"
				variant="danger"
				isLoading={deletePassword.isPending}
			/>
		</>
	);
};

export { EmptyTrashButton };
