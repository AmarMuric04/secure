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
			<motion.span
				initial={{ scale: 0.4, rotate: -30 }}
				animate={{ scale: 1, rotate: 0 }}
				transition={{
					type: "spring",
					stiffness: 380,
					damping: 16,
					delay: 0.1,
				}}
				className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
			>
				<Check className="size-5" strokeWidth={2.5} />
			</motion.span>
			<p className="mt-4 font-medium">
				{isFiltered ? "Nothing in this list" : "All clear"}
			</p>
			<p className="mt-1 max-w-xs text-sm text-muted-foreground">
				{isFiltered
					? "None of your passwords have this problem."
					: "No breached, weak or reused passwords in your vault."}
			</p>
		</motion.div>
	);
};

export { SecurityAllClear };
