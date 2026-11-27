import { secure } from "business-logic-secure";
import { CornerDownLeft, Plus } from "lucide-react";
import { useState } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
	Spinner,
	useToast,
} from "@/components/ui";

const NO_CATEGORY = "none";
const NEW_CATEGORY_STYLE = { icon: "folder", color: "#6b7280" };

const CategoryField: React.FC<{
	categoryId: string | null;
	onChange: (categoryId: string | null) => void;
}> = ({ categoryId, onChange }) => {
	const { data: vault } = secure.vault.useVault({ includeDeleted: false });
	const createCategory = secure.vault.useCreateCategory();
	const { addToast } = useToast();

	const [isOpen, setIsOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [name, setName] = useState("");

	const categories = vault?.categories ?? [];

	const handleOpenChange = (isNextOpen: boolean) => {
		setIsOpen(isNextOpen);

		if (!isNextOpen) {
			setIsCreating(false);
			setName("");
		}
	};

	const handleValueChange = (value: string) => {
		onChange(value === NO_CATEGORY ? null : value);
	};

	const handleCreate = () => {
		const trimmed = name.trim();

		if (!trimmed || createCategory.isPending) {
			return;
		}

		createCategory.mutate(
			{ name: trimmed, ...NEW_CATEGORY_STYLE },
			{
				onSuccess: ({ category }) => {
					onChange(category.id);
					handleOpenChange(false);
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

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.stopPropagation();

		if (event.key === "Enter") {
			event.preventDefault();
			handleCreate();
		}

		if (event.key === "Escape") {
			event.preventDefault();
			setIsCreating(false);
			setName("");
		}
	};

	const handleItemPointer = (event: React.PointerEvent) => {
		if (isCreating) {
			event.preventDefault();
		}
	};

	return (
		<Select
			open={isOpen}
			value={categoryId ?? NO_CATEGORY}
			onOpenChange={handleOpenChange}
			onValueChange={handleValueChange}
		>
			<SelectTrigger
				id="entry-category"
				className="-ml-2 h-10 w-auto min-w-40 bg-transparent px-2 ring-0 hover:bg-accent focus-visible:ring-2 data-[placeholder]:text-subtle"
			>
				<SelectValue placeholder="No category" />
			</SelectTrigger>
			<SelectContent className="min-w-56">
				<SelectItem
					value={NO_CATEGORY}
					onPointerMove={handleItemPointer}
					onPointerLeave={handleItemPointer}
				>
					No category
				</SelectItem>
				{categories.map((category) => (
					<SelectItem
						key={category.id}
						value={category.id}
						onPointerMove={handleItemPointer}
						onPointerLeave={handleItemPointer}
					>
						<span
							className="size-2 rounded-full"
							style={{ backgroundColor: category.color }}
						/>
						{category.name}
					</SelectItem>
				))}

				<SelectSeparator />

				{isCreating ? (
					<div className="flex h-8 items-center gap-2 rounded-lg bg-accent px-2">
						<span
							className="size-2 shrink-0 rounded-full"
							style={{ backgroundColor: NEW_CATEGORY_STYLE.color }}
						/>
						<input
							autoFocus
							aria-label="New category name"
							placeholder="Category name"
							maxLength={50}
							value={name}
							disabled={createCategory.isPending}
							onChange={(event) => setName(event.target.value)}
							onKeyDown={handleKeyDown}
							className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
						/>
						{createCategory.isPending ? (
							<Spinner size="sm" />
						) : (
							<CornerDownLeft className="size-3.5 shrink-0 text-subtle" />
						)}
					</div>
				) : (
					<button
						type="button"
						onClick={() => setIsCreating(true)}
						className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-sm text-primary outline-none hover:bg-accent focus-visible:bg-accent"
					>
						<Plus className="size-3.5" />
						New category
					</button>
				)}
			</SelectContent>
		</Select>
	);
};

export { CategoryField };
