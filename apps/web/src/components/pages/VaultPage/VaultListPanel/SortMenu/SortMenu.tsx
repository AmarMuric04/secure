import type {
	toDefaultVaultSort,
	VAULT_SORT_FIELDS,
} from "business-logic-secure";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check } from "lucide-react";

import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui";

const SORT_OPTIONS: {
	field: (typeof VAULT_SORT_FIELDS)[number];
	label: string;
}[] = [
	{ field: "title", label: "Name" },
	{ field: "updatedAt", label: "Last updated" },
	{ field: "createdAt", label: "Date created" },
	{ field: "passwordStrength", label: "Password strength" },
];

const SortMenu: React.FC<{
	sort: ReturnType<typeof toDefaultVaultSort>;
	onChange: (field: (typeof VAULT_SORT_FIELDS)[number]) => void;
}> = ({ sort, onChange }) => {
	const SortIcon =
		sort.order === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Sort"
					className="size-9.5 shrink-0 rounded-lg text-muted-foreground"
				>
					<SortIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="rounded-xl">
				{SORT_OPTIONS.map((option) => (
					<DropdownMenuItem
						key={option.field}
						onClick={() => onChange(option.field)}
					>
						<span className="flex-1">{option.label}</span>
						{sort.field === option.field && (
							<Check className="ml-2 size-4" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export { SortMenu };
