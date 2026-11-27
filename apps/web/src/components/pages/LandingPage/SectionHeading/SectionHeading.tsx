import { motion } from "motion/react";

import { revealProps } from "../landingMotion";

const SectionHeading: React.FC<{
	eyebrow: string;
	title: string;
	lede?: string;
}> = ({ eyebrow, title, lede }) => {
	return (
		<motion.div {...revealProps({})} className="max-w-3xl">
			<p className="text-sm font-medium text-primary">{eyebrow}</p>
			<h2 className="mt-4 text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-5xl">
				{title}
			</h2>
			{lede && (
				<p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
					{lede}
				</p>
			)}
		</motion.div>
	);
};

export { SectionHeading };
