import { motion } from "motion/react";

import { revealProps } from "../landingMotion";

const Chapter: React.FC<{
	id: string;
	number: string;
	label: string;
	title: string;
	children: React.ReactNode;
}> = ({ id, number, label, title, children }) => {
	return (
		<section id={id} className="mx-auto max-w-6xl scroll-mt-8 px-5 sm:px-8">
			<div className="grid gap-x-12 gap-y-8 border-t border-border py-20 lg:grid-cols-[11rem_minmax(0,1fr)] lg:py-28">
				<div className="lg:sticky lg:top-10 lg:self-start">
					<p className="flex items-baseline gap-3 text-xs text-subtle">
						<span className="font-mono text-foreground">
							{number}
						</span>
						{label}
					</p>
				</div>

				<div className="min-w-0">
					<motion.h2
						{...revealProps({})}
						className="max-w-2xl text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-4xl"
					>
						{title}
					</motion.h2>

					<div className="mt-12">{children}</div>
				</div>
			</div>
		</section>
	);
};

export { Chapter };
