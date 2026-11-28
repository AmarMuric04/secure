import { secure } from "business-logic-secure";

import { useToast } from "@/components/ui";

import { CategoryFormModal } from "../CategoryFormModal";

const NEW_CATEGORY_VALUES = { name: "", icon: "folder", color: "#6b7280" };

const CreateCategoryModal: React.FC<{ onClose: () => void }> = ({
	onClose,
}) => {
	const createCategory = secure.vault.useCreateCategory();
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

		createCategory.mutate(
			{ ...values, name },
			{
				onSuccess: () => {
					onClose();
					addToast({
						type: "success",
						title: "Category created",
						message: `${name} is ready to use`,
					});
				},
				onError: (error) =>
					addToast({
						type: "error",
						title: "Failed to create category",
						message: error.message,
					}),
			},
		);
	};

	return (
		<CategoryFormModal
			title="New category"
			submitLabel="Create"
			initialValues={NEW_CATEGORY_VALUES}
			isSubmitting={createCategory.isPending}
			onSubmit={handleSubmit}
			onClose={onClose}
		/>
	);
};

export { CreateCategoryModal };
