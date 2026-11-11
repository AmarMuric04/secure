import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const OptionChip: React.FC<{
	label: string;
	hint?: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}> = ({ label, hint, checked, onCheckedChange }) => {
	return (
		<button
			type="button"
			aria-pressed={checked}
			title={hint}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium ring-1 transition-[background-color,color,box-shadow] duration-200 ring-inset active:scale-[0.97]",
				checked
					? "bg-card text-foreground ring-input"
					: "text-subtle ring-border hover:text-muted-foreground",
			)}
		>
			<span
				className={cn(
					"grid size-3.5 place-items-center rounded-[4px] transition-colors duration-200",
					checked
						? "bg-primary text-primary-foreground"
						: "ring-1 ring-input",
				)}
			>
				{checked && (
					<Check
						strokeWidth={3.5}
						className="size-2.5 motion-safe:animate-[dial-dot-in_0.25s_var(--ease-pop)]"
					/>
				)}
			</span>
			{label}
		</button>
	);
};

export { OptionChip };
