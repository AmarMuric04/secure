import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

import { VaultPreview } from "./VaultPreview";

const SPECIFICATIONS = [
	{ label: "Encryption", value: "AES-256-GCM" },
	{ label: "Key derivation", value: "PBKDF2-SHA256, 600,000 rounds" },
	{ label: "Where it happens", value: "In your browser" },
];

const HeroSection: React.FC<{ isAuthenticated: boolean }> = ({
	isAuthenticated,
}) => {
	return (
		<section className="mx-auto max-w-6xl px-5 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
			<motion.h1
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: EASE_OUT }}
				className="max-w-5xl text-[2.6rem] leading-[1.02] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:text-[5.25rem]"
			>
				A password manager that can’t read your passwords.
			</motion.h1>

			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
				className="mt-10 grid gap-10 border-t border-foreground/15 pt-8 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20"
			>
				<p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
					SecureVault encrypts every entry in your browser with a key
					made from your master password, so our server only ever
					stores ciphertext.{" "}
					<Link
						to={isAuthenticated ? "/vault" : "/register"}
						className="group inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-foreground underline decoration-foreground/30 underline-offset-[0.2em] transition-colors hover:decoration-foreground"
					>
						{isAuthenticated
							? "Open your vault"
							: "Create your vault"}
						<ArrowRight className="size-4 transition-transform duration-300 ease-out-quint group-hover:translate-x-0.5" />
					</Link>
				</p>

				<dl className="grid content-start gap-3 text-sm">
					{SPECIFICATIONS.map((specification) => (
						<div
							key={specification.label}
							className="flex items-baseline justify-between gap-6"
						>
							<dt className="text-subtle">
								{specification.label}
							</dt>
							<dd className="text-right font-mono text-[13px]">
								{specification.value}
							</dd>
						</div>
					))}
				</dl>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
				className="mt-14 sm:mt-20"
			>
				<VaultPreview />
			</motion.div>
		</section>
	);
};

export { HeroSection };
