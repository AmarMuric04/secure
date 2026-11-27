import { useLocation } from "@tanstack/react-router";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

import { EncryptionDemo } from "./EncryptionDemo";

const NOTES = {
	signIn: {
		key: "sign-in",
		title: "Your master password never leaves this device.",
		steps: [
			{
				title: "Stretched in this browser",
				detail: "PBKDF2-SHA256 runs 600,000 rounds over your master password to make two keys.",
			},
			{
				title: "Only a hash is sent",
				detail: "One key produces an auth hash, which our server checks against the bcrypt hash it stores. The password itself is never sent.",
			},
			{
				title: "Your vault opens here",
				detail: "The other key unwraps your vault key, which stays in this tab’s memory until the vault locks.",
			},
		],
	},
	register: {
		key: "register",
		title: "We can’t reset your master password, so choose one you’ll remember.",
		steps: [
			{
				title: "Keys made on this device",
				detail: "Your master password is stretched with PBKDF2-SHA256 over 600,000 rounds. It is never sent to us.",
			},
			{
				title: "A random vault key",
				detail: "Your entries are encrypted with a new AES-256 key, which reaches our server only after your master password wraps it.",
			},
			{
				title: "A code to confirm your email",
				detail: "We email you a 6-digit code. It expires after 15 minutes.",
			},
		],
	},
};

const AuthNotes: React.FC = () => {
	const { pathname } = useLocation();

	const notes = pathname.startsWith("/register")
		? NOTES.register
		: NOTES.signIn;

	return (
		<motion.aside
			key={notes.key}
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
			className="border-t border-foreground/15 pt-10 lg:border-t-0 lg:border-l lg:pt-2 lg:pl-16 xl:pl-20"
		>
			<h2 className="max-w-xl text-[1.75rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-4xl">
				{notes.title}
			</h2>

			<ol className="mt-10">
				{notes.steps.map((step) => (
					<li
						key={step.title}
						className="border-t border-foreground/15 py-5"
					>
						<h3 className="font-medium tracking-tight">
							{step.title}
						</h3>
						<p className="mt-1 text-[15px] leading-relaxed text-pretty text-muted-foreground">
							{step.detail}
						</p>
					</li>
				))}
			</ol>

			<div className="hidden border-t border-foreground/15 pt-8 lg:block">
				<EncryptionDemo />
			</div>
		</motion.aside>
	);
};

export { AuthNotes };
