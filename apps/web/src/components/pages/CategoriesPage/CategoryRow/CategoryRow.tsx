import { Link } from "@tanstack/react-router";
import type { buildCategoryFolders, decryptVault } from "business-logic-secure";
import { Lock } from "lucide-react";

import { CategoryActions } from "../CategoryActions";
import { CategoryIcon } from "../CategoryIcon";

const toPreviewLine = ({
	count,
	titles,
}: {
	count: number;
	titles: string[];
}) => {
	if (count === 0) {
		return "No passwords yet";
	}

	const remaining = count - titles.length;

	return remaining > 0
		? `${titles.join(", ")} and ${remaining} more`
		: titles.join(", ");
};

const CategoryRow: React.FC<{
	folder: ReturnType<
		typeof buildCategoryFolders<
			Awaited<ReturnType<typeof decryptVault>>["categories"][number],
			Awaited<ReturnType<typeof decryptVault>>["passwords"][number]
		>
	>[number];
	onEdit: () => void;
	onDelete: () => void;
}> = ({ folder, onEdit, onDelete }) => {
	const { category, count, previewEntries } = folder;
	const isEditable = !category.isLocked && !category.isDefault;
	const previewLine = toPreviewLine({
		count,
		titles: previewEntries.map((entry) => entry.title),
	});

	return (
		<div className="group relative flex items-center gap-4 py-4">
			<CategoryIcon icon={category.icon} color={category.color} />

			<div className="min-w-0 flex-1">
				<Link
					to="/vault"
					search={{ category: category.id }}
					className="block truncate font-medium tracking-tight outline-none group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-4 after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
				>
					{category.name}
				</Link>
				<p className="truncate text-[13px] text-subtle">
					{previewLine}
				</p>
			</div>

			<span className="shrink-0 text-sm text-muted-foreground tabular-nums">
				{count}
			</span>

			{isEditable ? (
				<CategoryActions
					count={count}
					triggerClassName="relative z-10 -mr-1.5 text-muted-foreground"
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			) : (
				<span
					title="Default category"
					className="grid size-8 shrink-0 place-items-center text-subtle"
				>
					<Lock className="size-3.5" />
					<span className="sr-only">Default category</span>
				</span>
			)}
		</div>
	);
};

export { CategoryRow };
