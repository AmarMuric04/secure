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
import { useToast } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { CategoriesHeader } from "./CategoriesHeader";
import { CategoryFolder } from "./CategoryFolder";
import { EditCategoryModal } from "./EditCategoryModal";
import { FoldersSkeleton } from "./FoldersSkeleton";
import { NewFolderTile } from "./NewFolderTile";

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
			/>

			{vault.isPending && <FoldersSkeleton />}

			{vault.isError && (
				<QueryErrorState
					title="Failed to load categories"
					message={vault.error.message}
					onRetry={() => void vault.refetch()}
				/>
			)}

			{vault.isSuccess && (
				<ul className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
					{!searchQuery && (
						<motion.li
							layout
							transition={{ duration: 0.4, ease: EASE_OUT }}
							className={cn(isCreating && "sm:col-span-2")}
						>
							<NewFolderTile
								isOpen={isCreating}
								onOpenChange={setIsCreating}
							/>
						</motion.li>
					)}

					<AnimatePresence mode="popLayout">
						{visibleFolders.map((folder, index) => (
							<motion.li
								key={folder.category.id}
								layout
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.94 }}
								transition={{
									duration: 0.45,
									ease: EASE_OUT,
									delay: Math.min(index, 9) * 0.04,
								}}
							>
								<CategoryFolder
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

			{vault.isSuccess && searchQuery && visibleFolders.length === 0 && (
				<p className="py-16 text-center text-sm text-muted-foreground">
					No category matches “{searchQuery}”.
				</p>
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
