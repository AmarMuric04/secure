import { cn } from "@/lib/utils";

const SIZES = {
	sm: { box: "size-7 rounded-[9px]", icon: 16 },
	lg: { box: "size-12 rounded-[15px]", icon: 26 },
};

const VaultMark: React.FC<{ size: keyof typeof SIZES; className?: string }> = ({
	size,
	className,
}) => {
	return (
		<span
			className={cn(
				"grid shrink-0 place-items-center bg-primary text-primary-foreground",
				SIZES[size].box,
				className,
			)}
		>
			<svg
				width={SIZES[size].icon}
				height={SIZES[size].icon}
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<circle cx="12" cy="10" r="3.4" />
				<path d="M10.6 12.5h2.8l.9 6h-4.6z" />
			</svg>
		</span>
	);
};

export { VaultMark };
