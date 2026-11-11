import { Search, X } from "lucide-react";

import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

const VaultSearchInput: React.FC<{
	value: string;
	placeholder: string;
	onChange: (value: string) => void;
	className?: string;
	ref?: React.Ref<HTMLInputElement>;
}> = ({ value, placeholder, onChange, className, ref }) => {
	return (
		<div className={cn("relative flex-1", className)}>
			<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
			<Input
				ref={ref}
				type="text"
				placeholder={placeholder}
				aria-label={placeholder}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-9.5 rounded-lg border-0 bg-muted pr-9 pl-9 shadow-none ring-1 ring-border transition-[box-shadow,background-color] duration-200 placeholder:text-subtle focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary dark:bg-muted"
			/>
			{value ? (
				<button
					type="button"
					aria-label="Clear search"
					onClick={() => onChange("")}
					className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-subtle transition-colors hover:bg-accent hover:text-foreground"
				>
					<X className="size-3.5" />
				</button>
			) : (
				<kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-[5px] px-1.5 font-mono text-[11px] text-subtle ring-1 ring-input">
					/
				</kbd>
			)}
		</div>
	);
};

export { VaultSearchInput };
