import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { VaultMark } from "@/components/shared/VaultMark";

import { revealProps } from "../landingMotion";

const INLINE_LINK =
	"text-primary underline decoration-primary/30 decoration-1 underline-offset-[0.18em] transition-colors hover:decoration-primary";

const LandingClosing: React.FC<{ isAuthenticated: boolean }> = ({
	isAuthenticated,
}) => {
	return (
		<footer className="mx-auto max-w-6xl px-5 sm:px-8">
			<div className="border-t border-border">
				<motion.p
					{...revealProps({})}
					className="max-w-3xl py-24 text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:py-32"
				>
					{isAuthenticated ? (
						<>
							Your vault is waiting.{" "}
							<Link to="/vault" className={INLINE_LINK}>
								Open it
							</Link>
							.
						</>
					) : (
						<>
							Start with one password.{" "}
							<Link to="/register" className={INLINE_LINK}>
								Create your vault
							</Link>
							, or{" "}
							<Link to="/login" className={INLINE_LINK}>
								sign in
							</Link>
							.
						</>
					)}
				</motion.p>
			</div>

			<div className="flex items-center justify-between gap-4 border-t border-border py-6 text-xs text-subtle">
				<span className="flex items-center gap-2">
					<VaultMark size="sm" />
					SecureVault
				</span>
				<span>Encrypted in your browser, stored as ciphertext.</span>
			</div>
		</footer>
	);
};

export { LandingClosing };
