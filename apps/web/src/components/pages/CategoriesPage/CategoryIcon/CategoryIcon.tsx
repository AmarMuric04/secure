import { FolderOpen } from "lucide-react";

import { cn } from "@/lib/utils";

import { CATEGORY_ICONS } from "./categoryIcons";

const CategoryIcon: React.FC<{
	icon: string;
	color: string;
	className?: string;
}> = ({ icon, color, className }) => {
	const Icon = CATEGORY_ICONS[icon] ?? FolderOpen;

	return (
		<span
			className={cn(
				"grid size-9 shrink-0 place-items-center rounded-[11px]",
				className,
			)}
			style={{
				backgroundColor: `${color}1a`,
				boxShadow: `inset 0 0 0 1px ${color}2e`,
			}}
		>
			<Icon className="size-4.5" style={{ color }} />
		</span>
	);
};

export { CategoryIcon };
