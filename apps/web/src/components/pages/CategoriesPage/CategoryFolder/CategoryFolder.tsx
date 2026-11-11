import { Link } from "@tanstack/react-router";
import type { buildCategoryFolders, decryptVault } from "business-logic-secure";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { EASE_OUT } from "@/lib/motion";

import { CategoryActions } from "../CategoryActions";
import { CategoryIcon } from "../CategoryIcon";
import { FolderSheets } from "./FolderSheets";

const CategoryFolder: React.FC<{
	folder: ReturnType<
		typeof buildCategoryFolders<
			Awaited<ReturnType<typeof decryptVault>>["categories"][number],
			Awaited<ReturnType<typeof decryptVault>>["passwords"][number]
		>
	>[number];
	onEdit: () => void;
	onDelete: () => void;
}> = ({ folder, onEdit, onDelete }) => {
	const [isOpen, setIsOpen] = useState(false);

	const { category, count, previewEntries } = folder;
	const isEditable = !category.isLocked && !category.isDefault;

	return (
		<div
			onPointerEnter={() => setIsOpen(true)}
			onPointerLeave={() => setIsOpen(false)}
			onFocus={() => setIsOpen(true)}
			onBlur={() => setIsOpen(false)}
			className="relative h-52 rounded-xl [perspective:900px] has-[>a:focus-visible]:outline-2 has-[>a:focus-visible]:outline-offset-4 has-[>a:focus-visible]:outline-primary"
		>
			<span
				className="absolute top-0 left-0 h-7 w-24 rounded-t-xl"
				style={{ backgroundColor: `${category.color}26` }}
			/>
			<span
				className="absolute inset-x-0 top-5 bottom-0 rounded-xl rounded-tl-none"
				style={{ backgroundColor: `${category.color}26` }}
			/>

			<FolderSheets entries={previewEntries} isOpen={isOpen} />

			<motion.div
				initial={false}
				animate={isOpen ? { rotateX: -16, y: 2 } : { rotateX: 0, y: 0 }}
				transition={{ duration: 0.4, ease: EASE_OUT }}
				style={{ transformOrigin: "bottom center" }}
				className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex h-[56%] flex-col justify-between rounded-xl bg-card p-4 shadow-panel ring-1 ring-border"
			>
				<div className="flex items-start justify-between gap-3">
					<CategoryIcon
						icon={category.icon}
						color={category.color}
						className="size-8 rounded-[10px]"
					/>

					{isEditable ? (
						<CategoryActions
							count={count}
							triggerClassName="pointer-events-auto -mt-1 -mr-1"
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					) : (
						<span className="inline-flex items-center gap-1 text-xs text-subtle">
							<Lock className="size-3" />
							Default
						</span>
					)}
				</div>

				<div className="min-w-0">
					<p className="truncate font-medium">{category.name}</p>
					<p className="text-[13px] text-subtle tabular-nums">
						{count === 0
							? "Empty"
							: `${count} password${count === 1 ? "" : "s"}`}
					</p>
				</div>
			</motion.div>

			<Link
				to="/vault"
				search={{ category: category.id }}
				aria-label={`Open ${category.name}`}
				className="absolute inset-0 z-20 rounded-xl outline-none"
			/>
		</div>
	);
};

export { CategoryFolder };
