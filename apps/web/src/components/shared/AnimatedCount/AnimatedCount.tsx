import { AnimatePresence, motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const AnimatedCount: React.FC<{ value: number; className?: string }> = ({
	value,
	className,
}) => {
	return (
		<span
			className={cn(
				"relative inline-grid overflow-hidden tabular-nums",
				className,
			)}
		>
			<AnimatePresence initial={false} mode="popLayout">
				<motion.span
					key={value}
					initial={{ opacity: 0, y: "-60%" }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: "60%" }}
					transition={{ duration: 0.25, ease: EASE_OUT }}
					className="col-start-1 row-start-1"
				>
					{value}
				</motion.span>
			</AnimatePresence>
		</span>
	);
};

export { AnimatedCount };
