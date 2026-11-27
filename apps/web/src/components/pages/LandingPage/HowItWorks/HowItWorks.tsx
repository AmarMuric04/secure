import { motion } from "motion/react";

import { revealProps } from "../landingMotion";
import { SectionHeading } from "../SectionHeading";
import { SealDemo } from "./SealDemo";

const STEPS = [
	{
		title: "Your master password stays here",
		detail: "It is stretched with PBKDF2-SHA256 over 600,000 rounds into the keys that open your vault. It is never sent to us.",
	},
	{
		title: "Each entry is sealed before upload",
		detail: "Title, username, password, URL, notes and custom fields are encrypted with AES-256-GCM under your own random vault key.",
	},
	{
		title: "We keep only what we can’t read",
		detail: "The server stores ciphertext, your vault key wrapped by your password, and a bcrypt hash used to check sign-ins.",
	},
];

const HowItWorks: React.FC = () => {
	return (
		<section
			id="how-it-works"
			className="mx-auto max-w-6xl scroll-mt-6 px-5 pt-28 sm:px-8 lg:pt-40"
		>
			<SectionHeading
				eyebrow="How it works"
				title="Encrypted on your device, stored as ciphertext."
				lede="Zero-knowledge means the hard part happens in your browser. By the time anything reaches our server, it is already unreadable."
			/>

			<ol className="mt-14 grid gap-x-10 gap-y-10 sm:mt-16 md:grid-cols-3">
				{STEPS.map((step, index) => (
					<motion.li
						key={step.title}
						{...revealProps({ delay: index * 0.06 })}
						className="border-t border-foreground/15 pt-5"
					>
						<p className="font-mono text-xs text-subtle">
							0{index + 1}
						</p>
						<h3 className="mt-3 text-lg font-medium tracking-tight">
							{step.title}
						</h3>
						<p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
							{step.detail}
						</p>
					</motion.li>
				))}
			</ol>

			<SealDemo />
		</section>
	);
};

export { HowItWorks };
