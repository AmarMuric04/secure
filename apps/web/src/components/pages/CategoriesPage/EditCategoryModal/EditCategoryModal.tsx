import { type decryptVault, secure } from "business-logic-secure";

import { useToast } from "@/components/ui";

import { CategoryFormModal } from "../CategoryFormModal";

const EditCategoryModal: React.FC<{
	category: Awaited<ReturnType<typeof decryptVault>>["categories"][number];
	onClose: () => void;
}> = ({ category, onClose }) => {
	const updateCategory = secure.vault.useUpdateCategory();
	const { addToast } = useToast();

	const handleSubmit = (values: {
		name: string;
		icon: string;
		color: string;
	}) => {
		const name = values.name.trim();

		if (!name) {
			addToast({
				type: "error",
				title: "Name required",
				message: "Please enter a category name",
			});

			return;
		}

		updateCategory.mutate(
			{ id: category.id, ...values, name },
			{
				onSuccess: () => {
					onClose();
					addToast({
						type: "success",
						title: "Category updated",
						message: `${name} was updated`,
					});
				},
				onError: (error) =>
					addToast({
						type: "error",
						title: "Failed to update",
						message: error.message,
					}),
			},
		);
	};

	return (
		<CategoryFormModal
			title="Edit category"
			submitLabel="Save changes"
			initialValues={category}
			isSubmitting={updateCategory.isPending}
			onSubmit={handleSubmit}
			onClose={onClose}
		/>
	);
};

export { EditCategoryModal };
