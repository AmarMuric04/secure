import { Check } from "lucide-react";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const RING_RADIUS = 11;

const PurgeCountdownNode: React.FC<{
	title: string;
	daysLeft: number;
	ratio: number;
	isUrgent: boolean;
	isSelected: boolean;
	isSelectionMode: boolean;
	onToggle: () => void;
}> = ({
	title,
	daysLeft,
	ratio,
	isUrgent,
	isSelected,
	isSelectionMode,
	onToggle,
}) => {
	const isCheckboxVisible = isSelected || isSelectionMode;

	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={isSelected}
			aria-label={`Select ${title}`}
			onClick={onToggle}
			className="relative grid size-8 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
		>
			<span
				className={cn(
					"col-start-1 row-start-1 grid place-items-center transition-[opacity,transform] duration-200 ease-out-quint",
					isCheckboxVisible
						? "scale-75 opacity-0"
						: "group-hover:scale-75 group-hover:opacity-0",
				)}
			>
				<svg
					viewBox="0 0 28 28"
					aria-hidden="true"
					className="col-start-1 row-start-1 size-7 -rotate-90"
				>
					<circle
						cx="14"
						cy="14"
						r={RING_RADIUS}
						fill="none"
						strokeWidth="2.25"
						className="stroke-border"
					/>
					<motion.circle
						cx="14"
						cy="14"
						r={RING_RADIUS}
						fill="none"
						strokeWidth="2.25"
						strokeLinecap="round"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: ratio }}
						transition={{
							duration: 0.8,
							ease: EASE_OUT,
							delay: 0.15,
						}}
						className={
							isUrgent ? "stroke-warning" : "stroke-subtle"
						}
					/>
				</svg>
				<span
					className={cn(
						"col-start-1 row-start-1 font-mono text-[9.5px] font-medium tabular-nums",
						isUrgent ? "text-warning" : "text-muted-foreground",
					)}
				>
					{daysLeft}
				</span>
			</span>

			<span
				className={cn(
					"col-start-1 row-start-1 grid size-5 place-items-center rounded-full transition-[opacity,transform,background-color,box-shadow] duration-200 ease-out-quint",
					isSelected
						? "bg-primary text-primary-foreground"
						: "text-transparent ring-[1.5px] ring-input",
					isCheckboxVisible
						? "scale-100 opacity-100"
						: "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100",
				)}
			>
				<Check className="size-3" strokeWidth={3} />
			</span>
		</button>
	);
};

export { PurgeCountdownNode };
