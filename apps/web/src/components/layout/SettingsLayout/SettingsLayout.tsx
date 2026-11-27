import { Outlet, useMatches } from "@tanstack/react-router";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

import { SettingsNav } from "./SettingsNav";

const SettingsLayout: React.FC = () => {
	const renderedPathname = useMatches({
		select: (matches) => matches.at(-1)?.pathname,
	});

	return (
		<div className="flex flex-col gap-8 md:flex-row md:gap-14">
			<SettingsNav />

			<motion.div
				key={renderedPathname}
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: EASE_OUT }}
				className="min-w-0 flex-1 md:pt-7"
			>
				<Outlet />
			</motion.div>
		</div>
	);
};

export { SettingsLayout };
