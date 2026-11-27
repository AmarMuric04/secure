import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

const AuthStep: React.FC<{
	title: string;
	description: React.ReactNode;
	children: React.ReactNode;
}> = ({ title, description, children }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.5, ease: EASE_OUT }}
			className="flex flex-col"
		>
			<h1 className="text-[2.5rem] leading-[1.05] font-medium tracking-[-0.045em] text-balance sm:text-5xl">
				{title}
			</h1>
			<div className="mt-4 text-pretty text-muted-foreground">
				{description}
			</div>
			<div className="mt-10 flex flex-col gap-5">{children}</div>
		</motion.div>
	);
};

export { AuthStep };
