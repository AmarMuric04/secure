import {
	buildCategoryFolders,
	countFiledEntries,
	type decryptVault,
	filterCategories,
	secure,
} from "business-logic-secure";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { EmptyState, useToast } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

import { CategoriesHeader } from "./CategoriesHeader";
import { CategoriesSkeleton } from "./CategoriesSkeleton";
import { CategoryRow } from "./CategoryRow";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";

const PREVIEW_SIZE = 3;

const CategoriesPage: React.FC = () => {
	const vault = secure.vault.useVault({ includeDeleted: false });
	const deleteCategory = secure.vault.useDeleteCategory();
	const { addToast } = useToast();

	const [searchQuery, setSearchQuery] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [editingCategory, setEditingCategory] = useState<
		Awaited<ReturnType<typeof decryptVault>>["categories"][number] | null
	>(null);

	const allFolders = buildCategoryFolders({
		categories: vault.data?.categories ?? [],
		entries: vault.data?.passwords ?? [],
		previewSize: PREVIEW_SIZE,
	});
	const visibleFolders = buildCategoryFolders({
		categories: filterCategories({
			categories: vault.data?.categories ?? [],
			query: searchQuery,
		}),
		entries: vault.data?.passwords ?? [],
		previewSize: PREVIEW_SIZE,
	});
	const summary = vault.isSuccess
		? {
				categoryCount: allFolders.length,
				filedCount: countFiledEntries(allFolders),
			}
		: null;

	const handleDelete = (
		category: Awaited<
			ReturnType<typeof decryptVault>
		>["categories"][number],
	) => {
		deleteCategory.mutate(
			{ id: category.id },
			{
				onSuccess: () =>
					addToast({
						type: "success",
						title: "Category deleted",
						message: `${category.name} was deleted`,
					}),
				onError: (error) =>
					addToast({
						type: "error",
						title: "Failed to delete",
						message: error.message,
					}),
			},
		);
	};

	return (
		<div>
			<CategoriesHeader
				summary={summary}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				onCreate={() => setIsCreating(true)}
			/>

			{vault.isPending && <CategoriesSkeleton />}

			{vault.isError && (
				<QueryErrorState
					title="Failed to load categories"
					message={vault.error.message}
					onRetry={() => void vault.refetch()}
				/>
			)}

			{vault.isSuccess && visibleFolders.length > 0 && (
				<ul className="divide-y divide-border border-y border-t-foreground/15 border-b-border">
					<AnimatePresence initial={false}>
						{visibleFolders.map((folder, index) => (
							<motion.li
								key={folder.category.id}
								layout
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								transition={{
									duration: 0.35,
									ease: EASE_OUT,
									delay: Math.min(index, 9) * 0.03,
								}}
							>
								<CategoryRow
									folder={folder}
									onEdit={() =>
										setEditingCategory(folder.category)
									}
									onDelete={() =>
										handleDelete(folder.category)
									}
								/>
							</motion.li>
						))}
					</AnimatePresence>
				</ul>
			)}

			{vault.isSuccess && allFolders.length === 0 && (
				<EmptyState
					title="No categories yet"
					description="Make one for work, banking or anything else, then file logins into it from the entry form."
				/>
			)}

			{vault.isSuccess && searchQuery && visibleFolders.length === 0 && (
				<p className="py-16 text-center text-sm text-muted-foreground">
					No category matches “{searchQuery}”.
				</p>
			)}

			{isCreating && (
				<CreateCategoryModal onClose={() => setIsCreating(false)} />
			)}

			{editingCategory && (
				<EditCategoryModal
					category={editingCategory}
					onClose={() => setEditingCategory(null)}
				/>
			)}
		</div>
	);
};

export { CategoriesPage };
