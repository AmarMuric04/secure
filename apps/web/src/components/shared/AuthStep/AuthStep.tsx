import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

const AuthStep: React.FC<{
	title: string;
	description: React.ReactNode;
	icon?: React.ReactNode;
	children: React.ReactNode;
}> = ({ title, description, icon, children }) => {
	return (
		<motion.div
			initial={{ opacity: 0, x: 24 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -24 }}
			transition={{ duration: 0.35, ease: EASE_OUT }}
			className="flex flex-col"
		>
			{icon && (
				<motion.span
					initial={{ scale: 0.6, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 420,
						damping: 22,
						delay: 0.08,
					}}
					className="mb-6 grid size-11 place-items-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5"
				>
					{icon}
				</motion.span>
			)}
			<h1 className="text-3xl font-semibold tracking-tight text-balance">
				{title}
			</h1>
			<div className="mt-2 text-muted-foreground">{description}</div>
			<div className="mt-8 flex flex-col gap-5">{children}</div>
		</motion.div>
	);
};

export { AuthStep };
