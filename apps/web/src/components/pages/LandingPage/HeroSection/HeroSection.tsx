import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

import { EASE_OUT } from "../landingMotion";
import { HeroField } from "../HeroField";
import { HeroDial } from "./HeroDial";

const SPECIFICATIONS = [
	{ label: "Cipher", value: "AES-256-GCM" },
	{ label: "Key derivation", value: "PBKDF2-SHA256 × 600,000" },
	{ label: "Auto-lock", value: "15 min idle, adjustable" },
];

const HEADLINE_LINES = [
	{ text: "Your passwords,", className: "" },
	{ text: "sealed before they", className: "text-muted-foreground" },
	{ text: "leave this screen.", className: "text-muted-foreground" },
];

const HeroSection: React.FC<{
	phrase: string;
	isAuthenticated: boolean;
	isPhraseEdited: boolean;
	onAutoType: (phrase: string) => void;
	onPhraseEdit: (phrase: string) => void;
	onSeal: () => void;
}> = ({
	phrase,
	isAuthenticated,
	isPhraseEdited,
	onAutoType,
	onPhraseEdit,
	onSeal,
}) => {
	const dialRef = useRef<HTMLDivElement>(null);

	return (
		<section className="relative isolate mx-auto max-w-6xl px-5 sm:px-8">
			<HeroField phrase={phrase} anchorRef={dialRef} />

			<div className="grid items-center gap-16 pt-14 pb-20 lg:grid-cols-[minmax(0,1fr)_24rem] lg:pt-24 lg:pb-28">
				<div className="relative z-10">
					<h1 className="text-[2.4rem] leading-[1.04] font-semibold tracking-[-0.045em] min-[400px]:text-[2.75rem] sm:text-6xl lg:text-7xl">
						{HEADLINE_LINES.map((line, index) => (
							<motion.span
								key={line.text}
								initial={{ opacity: 0, y: 18 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.7,
									ease: EASE_OUT,
									delay: 0.08 * index,
								}}
								className={cn("block", line.className)}
							>
								{line.text}
							</motion.span>
						))}
					</h1>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.35 }}
						className="mt-10"
					>
						<Link
							to={isAuthenticated ? "/vault" : "/register"}
							className="group inline-flex w-fit items-center gap-2 font-medium text-primary"
						>
							{isAuthenticated
								? "Open your vault"
								: "Create your vault"}
							<ArrowRight className="size-4 transition-transform duration-300 ease-out-quint group-hover:translate-x-1" />
						</Link>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
				>
					<HeroDial
						dialRef={dialRef}
						phrase={phrase}
						isEdited={isPhraseEdited}
						onAutoType={onAutoType}
						onEdit={onPhraseEdit}
						onSeal={onSeal}
					/>
				</motion.div>
			</div>

			<dl className="grid border-t border-border sm:grid-cols-3">
				{SPECIFICATIONS.map((specification) => (
					<div
						key={specification.label}
						className="flex items-baseline justify-between gap-4 border-b border-border py-4 sm:block sm:border-b-0 sm:py-5"
					>
						<dt className="text-xs text-subtle">
							{specification.label}
						</dt>
						<dd className="font-mono text-sm sm:mt-1.5">
							{specification.value}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
};

export { HeroSection };
