import { motion } from "motion/react";

import { revealProps } from "../landingMotion";
import { SectionHeading } from "../SectionHeading";

const FEATURES = [
	{
		title: "Security report",
		detail: "Flags weak, reused and breached passwords. Breach checks send only the first five characters of a hash to Have I Been Pwned.",
	},
	{
		title: "Generator",
		detail: "Random passwords or passphrases from the EFF word list, with a strength meter as you go.",
	},
	{
		title: "Import and export",
		detail: "Bring a CSV export from Bitwarden, 1Password, Chrome or Edge, and download an encrypted backup whenever you like.",
	},
	{
		title: "Two-factor sign-in",
		detail: "Optional authenticator-app codes with backup codes, email confirmation on sign-up, and Google sign-in.",
	},
	{
		title: "Auto-lock",
		detail: "The vault locks after the idle time you choose and on every reload, and copied passwords are cleared from the clipboard.",
	},
	{
		title: "Organised your way",
		detail: "Categories, tags, favourites and custom fields, plus a trash you can restore from.",
	},
];

const FeatureList: React.FC = () => {
	return (
		<section
			id="features"
			className="mx-auto max-w-6xl scroll-mt-6 px-5 pt-28 sm:px-8 lg:pt-40"
		>
			<SectionHeading
				eyebrow="Features"
				title="The everyday parts, done carefully."
			/>

			<dl className="mt-14 grid gap-x-16 sm:mt-16 md:grid-cols-2">
				{FEATURES.map((feature, index) => (
					<motion.div
						key={feature.title}
						{...revealProps({ delay: (index % 2) * 0.06 })}
						className="grid gap-2 border-t border-foreground/15 py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
					>
						<dt className="font-medium tracking-tight">
							{feature.title}
						</dt>
						<dd className="text-[15px] leading-relaxed text-pretty text-muted-foreground">
							{feature.detail}
						</dd>
					</motion.div>
				))}
			</dl>
		</section>
	);
};

export { FeatureList };
