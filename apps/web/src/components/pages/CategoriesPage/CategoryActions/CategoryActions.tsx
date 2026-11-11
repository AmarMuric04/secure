import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui";

const CategoryActions: React.FC<{
	count: number;
	triggerClassName?: string;
	onEdit: () => void;
	onDelete: () => void;
}> = ({ count, triggerClassName, onEdit, onDelete }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Category actions"
					className={triggerClassName}
				>
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuItem onClick={onEdit}>
					<Pencil />
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={count > 0}
					onClick={onDelete}
					className="items-start text-destructive focus:text-destructive [&_svg]:mt-0.5 [&_svg]:text-destructive"
				>
					<Trash2 />
					<span>
						Delete
						{count > 0 && (
							<span className="block text-xs text-muted-foreground">
								Move its {count} password
								{count === 1 ? "" : "s"} out first
							</span>
						)}
					</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export { CategoryActions };
