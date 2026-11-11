import { motion } from "motion/react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SecurityProgress: React.FC<{
	healthyCount: number;
	total: number;
	healthyPercentage: number;
	actions: React.ReactNode;
}> = ({ healthyCount, total, healthyPercentage, actions }) => {
	const isClear = healthyCount === total;
	const remainder = isClear
		? "nothing to fix right now"
		: `${total - healthyCount} left to fix`;

	return (
		<div>
			<PageHeader
				title="Security"
				description={`${healthyCount} of ${total} passwords healthy · ${remainder}`}
				actions={actions}
			/>

			<div className="-mt-1 h-2 overflow-hidden rounded-full bg-accent">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${healthyPercentage}%` }}
					transition={{ duration: 0.9, ease: EASE_OUT }}
					className={cn(
						"h-full rounded-full",
						isClear ? "bg-success" : "bg-primary",
					)}
				/>
			</div>
		</div>
	);
};

export { SecurityProgress };
