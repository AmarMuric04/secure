import { motion } from "motion/react";

import { pickGlyph, revealProps } from "../landingMotion";

const GLYPH_ROW_LENGTH = 90;
const GLYPH_ROWS = Array.from({ length: 4 }, (_, index) => ({
	index,
	text: Array.from({ length: GLYPH_ROW_LENGTH }, pickGlyph).join(""),
	duration: 70 + index * 18,
	direction: index % 2 ? 1 : -1,
}));
const FACTS = [
	{ value: "600,000", label: "PBKDF2-SHA256 rounds" },
	{ value: "256-bit", label: "AES-GCM vault key" },
	{ value: "1 salt", label: "of its own per account" },
];

const KeyBand: React.FC = () => {
	return (
		<section className="relative overflow-hidden bg-band text-band-foreground">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-6 font-mono text-6xl leading-none whitespace-nowrap text-band-foreground/[0.045] select-none"
			>
				{GLYPH_ROWS.map((row) => (
					<motion.div
						key={row.index}
						animate={{
							x:
								row.direction > 0
									? ["-50%", "0%"]
									: ["0%", "-50%"],
						}}
						transition={{
							duration: row.duration,
							ease: "linear",
							repeat: Infinity,
						}}
						className="w-max will-change-transform"
					>
						{row.text}
						{row.text}
					</motion.div>
				))}
			</div>

			<div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
				<motion.p
					{...revealProps({})}
					className="font-mono text-xs text-band-muted"
				>
					Key derivation
				</motion.p>
				<motion.h2
					{...revealProps({ delay: 0.05 })}
					className="mt-5 max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-5xl"
				>
					Before your master password can open anything, it’s
					stretched through six hundred thousand rounds.
				</motion.h2>
				<motion.p
					{...revealProps({ delay: 0.1 })}
					className="mt-6 max-w-xl text-pretty text-band-muted"
				>
					That makes every guess slow for anyone trying to brute-force
					it, while unlocking still only takes you a moment.
				</motion.p>

				<dl className="mt-16 grid gap-8 border-t border-band-foreground/15 pt-8 sm:grid-cols-3">
					{FACTS.map((fact, index) => (
						<motion.div
							key={fact.label}
							{...revealProps({ delay: 0.15 + index * 0.06 })}
						>
							<dt className="font-mono text-2xl tracking-tight sm:text-3xl">
								{fact.value}
							</dt>
							<dd className="mt-1 text-sm text-band-muted">
								{fact.label}
							</dd>
						</motion.div>
					))}
				</dl>
			</div>
		</section>
	);
};

export { KeyBand };
