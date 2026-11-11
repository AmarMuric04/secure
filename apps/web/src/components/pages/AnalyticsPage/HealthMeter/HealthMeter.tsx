import { readHealthLevel } from "business-logic-secure";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const LEVEL_FILLS = {
	good: "bg-primary",
	fair: "bg-warning",
	poor: "bg-destructive",
};
const HealthMeter: React.FC<{
	label: string;
	percentage: number;
	className?: string;
}> = ({ label, percentage, className }) => {
	return (
		<div
			role="meter"
			aria-label={label}
			aria-valuenow={percentage}
			aria-valuemin={0}
			aria-valuemax={100}
			className={cn(
				"h-1.5 overflow-hidden rounded-full bg-accent",
				className,
			)}
		>
			<motion.div
				initial={{ width: 0 }}
				animate={{ width: `${percentage}%` }}
				transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
				className={cn(
					"h-full rounded-full",
					LEVEL_FILLS[readHealthLevel(percentage)],
				)}
			/>
		</div>
	);
};

export { HealthMeter };
