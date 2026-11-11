import { secure } from "business-logic-secure";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";

const NO_CATEGORY = "none";

const CategoryField: React.FC<{
	categoryId: string | null;
	onChange: (categoryId: string | null) => void;
}> = ({ categoryId, onChange }) => {
	const { data: vault } = secure.vault.useVault({ includeDeleted: false });

	const categories = vault?.categories ?? [];

	const handleValueChange = (value: string) => {
		onChange(value === NO_CATEGORY ? null : value);
	};

	return (
		<Select
			value={categoryId ?? NO_CATEGORY}
			onValueChange={handleValueChange}
		>
			<SelectTrigger
				id="entry-category"
				className="-ml-2 h-10 w-auto min-w-40 bg-transparent px-2 ring-0 hover:bg-accent focus-visible:ring-2 data-[placeholder]:text-subtle"
			>
				<SelectValue placeholder="No category" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={NO_CATEGORY}>No category</SelectItem>
				{categories.map((category) => (
					<SelectItem key={category.id} value={category.id}>
						<span
							className="size-2 rounded-full"
							style={{ backgroundColor: category.color }}
						/>
						{category.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export { CategoryField };
