import { secure, STRENGTH_LABELS } from "business-logic-secure";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STRENGTH_LEVELS = [0, 1, 2, 3, 4];
const STRENGTH_COLORS = [
	"bg-destructive",
	"bg-destructive",
	"bg-warning",
	"bg-muted-foreground",
	"bg-muted-foreground",
];
const VaultStrengthBars: React.FC<{
	strength: number;
	isStacked?: boolean;
	className?: string;
}> = ({ strength, isStacked = false, className }) => {
	const { data: user } = secure.auth.useSession();

	if (!user?.settings.showPasswordStrength) {
		return null;
	}

	return (
		<div
			className={cn(
				isStacked
					? "flex flex-col items-end gap-1.5"
					: "flex items-center gap-2",
				className,
			)}
		>
			<div
				className={cn(
					"flex",
					isStacked ? "items-center gap-1" : "gap-[3px]",
				)}
			>
				{STRENGTH_LEVELS.map((level) => (
					<div
						key={level}
						className={cn(
							"h-1 overflow-hidden rounded-full bg-input",
							isStacked ? "w-3" : "w-5",
						)}
					>
						{level <= strength && (
							<motion.div
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{
									duration: 0.3,
									delay: level * 0.05,
									ease: EASE_OUT,
								}}
								className={cn(
									"h-full origin-left rounded-full",
									STRENGTH_COLORS[strength],
								)}
							/>
						)}
					</div>
				))}
			</div>
			<span className="text-xs whitespace-nowrap text-subtle">
				{STRENGTH_LABELS[strength]}
			</span>
		</div>
	);
};

export { VaultStrengthBars };
