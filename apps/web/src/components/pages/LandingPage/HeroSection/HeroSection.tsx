import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

import { VaultPreview } from "./VaultPreview";

const HeroActions: React.FC<{ isAuthenticated: boolean }> = ({
	isAuthenticated,
}) => {
	if (isAuthenticated) {
		return (
			<Button asChild variant="ink" size="xl">
				<Link to="/vault">Open your vault</Link>
			</Button>
		);
	}

	return (
		<>
			<Button asChild variant="ink" size="xl">
				<Link to="/register">Create your vault</Link>
			</Button>
			<Link
				to="/login"
				className="text-[15px] font-medium underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
			>
				Sign in
			</Link>
		</>
	);
};

const HeroSection: React.FC<{ isAuthenticated: boolean }> = ({
	isAuthenticated,
}) => {
	return (
		<section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-24 lg:pt-28">
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: EASE_OUT }}
				className="text-center"
			>
				<h1 className="mx-auto max-w-4xl text-[2.6rem] leading-[1.04] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.75rem]">
					A password manager that can’t read your passwords.
				</h1>

				<p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
					SecureVault encrypts every entry in your browser with a key
					made from your master password. Our server only ever stores
					ciphertext.
				</p>

				<div className="mt-9 flex items-center justify-center gap-6">
					<HeroActions isAuthenticated={isAuthenticated} />
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
				className="mt-16 sm:mt-20"
			>
				<VaultPreview />
			</motion.div>
		</section>
	);
};

export { HeroSection };
