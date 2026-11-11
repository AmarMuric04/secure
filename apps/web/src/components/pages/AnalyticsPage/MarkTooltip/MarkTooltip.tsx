import { cn } from "@/lib/utils";

const MarkTooltip: React.FC<{
	label: string;
	className?: string;
	style?: React.CSSProperties;
	children?: React.ReactNode;
}> = ({ label, className, style, children }) => {
	return (
		<span
			tabIndex={0}
			aria-label={label}
			style={style}
			className={cn(
				"group/mark relative outline-none focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
		>
			{children}
			<span
				role="tooltip"
				className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 rounded-lg bg-popover px-2.5 py-1.5 text-xs font-normal whitespace-nowrap text-popover-foreground opacity-0 shadow-pop transition-[opacity,transform] duration-200 ease-out-quint group-hover/mark:translate-y-0 group-hover/mark:opacity-100 group-focus-visible/mark:translate-y-0 group-focus-visible/mark:opacity-100"
			>
				{label}
			</span>
		</span>
	);
};

export { MarkTooltip };
