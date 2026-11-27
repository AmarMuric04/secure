import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { VaultMark } from "@/components/shared/VaultMark";
import { Button } from "@/components/ui";

import { revealProps } from "../landingMotion";

const INVERTED_BUTTON =
	"bg-band-foreground text-band hover:bg-band-foreground/90";

const ClosingActions: React.FC<{ isAuthenticated: boolean }> = ({
	isAuthenticated,
}) => {
	if (isAuthenticated) {
		return (
			<Button asChild size="xl" className={INVERTED_BUTTON}>
				<Link to="/vault">Open your vault</Link>
			</Button>
		);
	}

	return (
		<>
			<Button asChild size="xl" className={INVERTED_BUTTON}>
				<Link to="/register">Create your vault</Link>
			</Button>
			<Link
				to="/login"
				className="text-[15px] font-medium underline decoration-band-foreground/40 underline-offset-4 transition-colors hover:decoration-band-foreground"
			>
				Sign in
			</Link>
		</>
	);
};

const LandingClosing: React.FC<{ isAuthenticated: boolean }> = ({
	isAuthenticated,
}) => {
	return (
		<footer className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 lg:pt-40">
			<motion.div
				{...revealProps({})}
				className="flex flex-col gap-8 rounded-[1.75rem] bg-band px-7 py-12 text-band-foreground sm:px-12 sm:py-16 lg:flex-row lg:items-end lg:justify-between"
			>
				<div className="max-w-xl">
					<p className="text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-5xl">
						{isAuthenticated
							? "Your vault is waiting."
							: "Start with one password."}
					</p>
					<p className="mt-4 text-pretty text-band-muted">
						Add the rest when you’re ready, or import them from the
						manager you use today.
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-6">
					<ClosingActions isAuthenticated={isAuthenticated} />
				</div>
			</motion.div>

			<div className="flex flex-col gap-3 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
				<span className="flex items-center gap-2.5 font-medium text-foreground">
					<VaultMark size="sm" />
					SecureVault
				</span>
				<span>Encrypted in your browser, stored as ciphertext.</span>
			</div>
		</footer>
	);
};

export { LandingClosing };
