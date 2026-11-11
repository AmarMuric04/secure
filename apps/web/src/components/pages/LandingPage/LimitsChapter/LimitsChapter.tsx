import { motion } from "motion/react";

import { Chapter } from "../Chapter";
import { revealProps } from "../landingMotion";

const LIMITS = [
	{
		statement: "We can't read your vault.",
		detail: "Our database holds ciphertext like the line in chapter 01, plus the folder, tags and favourite flag you set.",
	},
	{
		statement: "We can't reset your master password.",
		detail: "No recovery key exists on our side. If you forget it, the vault stays sealed, so choose one you'll remember.",
	},
	{
		statement: "We can't see what you typed on this page.",
		detail: "The demo above runs entirely in your browser. Nothing was sent anywhere.",
	},
];

const LimitsChapter: React.FC = () => {
	return (
		<Chapter
			id="limits"
			number="03"
			label="By design"
			title="Some things we simply can't do for you."
		>
			<ol>
				{LIMITS.map((limit, index) => (
					<motion.li
						key={limit.statement}
						{...revealProps({ delay: index * 0.08 })}
						className="grid gap-x-10 gap-y-2 border-t border-border py-7 last:border-b md:grid-cols-[minmax(0,1fr)_18rem]"
					>
						<p className="text-xl font-medium tracking-tight sm:text-2xl">
							{limit.statement}
						</p>
						<p className="text-sm text-pretty text-muted-foreground md:pt-1.5">
							{limit.detail}
						</p>
					</motion.li>
				))}
			</ol>
		</Chapter>
	);
};

export { LimitsChapter };
