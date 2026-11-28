import { Check } from "lucide-react";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

const SecurityAllClear: React.FC<{ isFiltered: boolean }> = ({
	isFiltered,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: EASE_OUT }}
			className="flex flex-col items-center py-16 text-center"
		>
			<Check className="size-5 text-success" />
			<p className="mt-4 text-xl font-medium tracking-[-0.02em]">
				{isFiltered ? "Nothing in this list" : "All clear"}
			</p>
			<p className="mt-1.5 max-w-xs text-sm text-pretty text-muted-foreground">
				{isFiltered
					? "None of your passwords have this problem."
					: "No breached, weak or reused passwords in your vault."}
			</p>
		</motion.div>
	);
};

export { SecurityAllClear };
