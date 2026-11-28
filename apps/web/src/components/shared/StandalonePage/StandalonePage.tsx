import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { VaultMark } from "@/components/shared/VaultMark";
import { EASE_OUT } from "@/lib/motion";

const StandalonePage: React.FC<{
	title: string;
	children: React.ReactNode;
}> = ({ title, children }) => {
	return (
		<div className="flex min-h-svh flex-col bg-background">
			<header className="mx-auto flex h-18 w-full max-w-6xl items-center px-5 sm:px-8">
				<Link
					to="/"
					className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
				>
					<VaultMark size="sm" />
					Sealed
				</Link>
			</header>

			<motion.main
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: EASE_OUT }}
				className="mx-auto w-full max-w-6xl flex-1 px-5 pt-14 pb-20 sm:px-8 sm:pt-20 lg:pt-24"
			>
				<h1 className="max-w-4xl text-[2.6rem] leading-[1.02] font-medium tracking-[-0.045em] text-balance sm:text-6xl">
					{title}
				</h1>

				<div className="mt-10 max-w-2xl border-t border-foreground/15 pt-8 sm:mt-14">
					{children}
				</div>
			</motion.main>
		</div>
	);
};

export { StandalonePage };
