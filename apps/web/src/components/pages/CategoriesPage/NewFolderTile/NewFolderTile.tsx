import { secure } from "business-logic-secure";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Button, useToast } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { CategoryFields } from "../CategoryFields";
import { CategoryIcon } from "../CategoryIcon";

const NEW_FOLDER_VALUES = { name: "", icon: "folder", color: "#6b7280" };

const NewFolderTile: React.FC<{
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
	const createCategory = secure.vault.useCreateCategory();
	const { addToast } = useToast();

	const [values, setValues] = useState(NEW_FOLDER_VALUES);
	const [isNameMissing, setIsNameMissing] = useState(false);

	const handleClose = () => {
		onOpenChange(false);
		setValues(NEW_FOLDER_VALUES);
		setIsNameMissing(false);
	};

	const handleNameChange = (name: string) => {
		setValues((current) => ({ ...current, name }));
		setIsNameMissing(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape") {
			handleClose();
		}
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		const name = values.name.trim();

		if (!name) {
			setIsNameMissing(true);

			return;
		}

		createCategory.mutate(
			{ ...values, name },
			{
				onSuccess: () => {
					handleClose();
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
		<AnimatePresence initial={false} mode="wait">
			{isOpen ? (
				<motion.form
					key="form"
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.98 }}
					transition={{ duration: 0.3, ease: EASE_OUT }}
					onSubmit={handleSubmit}
					onKeyDown={handleKeyDown}
					className="flex h-full flex-col gap-5 rounded-xl bg-card p-5 shadow-pop ring-1 ring-border sm:flex-row"
				>
					<div className="flex flex-col gap-3 sm:w-56 sm:shrink-0">
						<div className="flex items-center gap-3">
							<CategoryIcon
								icon={values.icon}
								color={values.color}
							/>
							<p className="text-sm font-medium">New category</p>
						</div>

						<input
							aria-label="Category name"
							placeholder="Category name"
							autoFocus
							value={values.name}
							onChange={(event) =>
								handleNameChange(event.target.value)
							}
							className={cn(
								"h-10 w-full border-b bg-transparent text-lg font-medium tracking-tight outline-none placeholder:text-subtle",
								isNameMissing
									? "border-destructive"
									: "border-input focus:border-primary",
							)}
						/>
						<p
							aria-live="polite"
							className="min-h-4 text-xs text-destructive"
						>
							{isNameMissing ? "Give the category a name" : ""}
						</p>

						<div className="mt-auto flex gap-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleClose}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								size="sm"
								isLoading={createCategory.isPending}
							>
								Create
							</Button>
						</div>
					</div>

					<div className="min-w-0 flex-1">
						<CategoryFields
							icon={values.icon}
							color={values.color}
							onIconChange={(icon) =>
								setValues((current) => ({ ...current, icon }))
							}
							onColorChange={(color) =>
								setValues((current) => ({ ...current, color }))
							}
						/>
					</div>
				</motion.form>
			) : (
				<motion.button
					key="tile"
					type="button"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					onClick={() => onOpenChange(true)}
					className="group relative block h-52 w-full rounded-xl text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
				>
					<span className="absolute top-0 left-0 h-7 w-24 rounded-t-xl border border-b-0 border-dashed border-input" />
					<span className="absolute inset-x-0 top-[1.6rem] bottom-0 rounded-xl rounded-tl-none border border-dashed border-input transition-colors duration-200 group-hover:border-subtle group-hover:bg-muted/60" />
					<span className="absolute inset-0 top-7 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors group-hover:text-foreground">
						<span className="grid size-9 place-items-center rounded-full bg-muted ring-1 ring-border transition-transform duration-300 ease-out-quint group-hover:rotate-90">
							<Plus className="size-4" />
						</span>
						<span className="text-sm font-medium">
							New category
						</span>
					</span>
				</motion.button>
			)}
		</AnimatePresence>
	);
};

export { NewFolderTile };
