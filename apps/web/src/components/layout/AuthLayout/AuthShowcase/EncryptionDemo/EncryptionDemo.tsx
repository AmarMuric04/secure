import { Cloud, KeyRound, Laptop } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { EASE_OUT } from "@/lib/motion";

const SAMPLES = [
	{ site: "github.com", secret: "correct-horse-battery" },
	{ site: "bank.example", secret: "Tr0pical!Mango#42" },
	{ site: "mail.example", secret: "violet sunrise ledger" },
];
const CIPHER_GLYPHS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CIPHER_LENGTH = 28;
const CYCLE_MILLISECONDS = 4_200;
const TICK_MILLISECONDS = 45;
const SETTLED_TICK = CIPHER_LENGTH * 2 + 8;

const randomGlyph = () =>
	CIPHER_GLYPHS.charAt(Math.floor(Math.random() * CIPHER_GLYPHS.length));

const randomCipher = () =>
	Array.from({ length: CIPHER_LENGTH }, randomGlyph).join("");

const EncryptionDemo: React.FC = () => {
	const isReducedMotion = useReducedMotion();
	const [sampleIndex, setSampleIndex] = useState(0);
	const [target, setTarget] = useState(randomCipher);
	const [tick, setTick] = useState(SETTLED_TICK);

	const sample = SAMPLES[sampleIndex] ?? SAMPLES[0];

	useEffect(() => {
		if (isReducedMotion) {
			return;
		}

		const cycle = window.setInterval(() => {
			setSampleIndex((index) => (index + 1) % SAMPLES.length);
			setTarget(randomCipher());
			setTick(0);
		}, CYCLE_MILLISECONDS);

		return () => window.clearInterval(cycle);
	}, [isReducedMotion]);

	useEffect(() => {
		if (tick >= SETTLED_TICK) {
			return;
		}

		const timeout = window.setTimeout(
			() => setTick(tick + 1),
			TICK_MILLISECONDS,
		);

		return () => window.clearTimeout(timeout);
	}, [tick]);

	const cipher = Array.from(target, (character, index) => {
		if (tick >= index * 2 + 8) {
			return character;
		}

		return tick >= index ? randomGlyph() : "·";
	}).join("");

	return (
		<div className="w-[360px] rounded-2xl bg-card/85 p-5 shadow-pop backdrop-blur-md">
			<div className="flex items-center gap-2 text-xs text-subtle">
				<Laptop className="size-3.5" />
				On your device
			</div>
			<div className="mt-2.5 flex h-11 items-center justify-between gap-3 rounded-lg bg-muted px-3.5 ring-1 ring-border ring-inset">
				<AnimatePresence mode="popLayout" initial={false}>
					<motion.span
						key={sample?.secret}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.35, ease: EASE_OUT }}
						className="truncate font-mono text-sm text-foreground"
					>
						{sample?.secret}
					</motion.span>
				</AnimatePresence>
				<span className="shrink-0 text-xs text-subtle">
					{sample?.site}
				</span>
			</div>

			<div className="relative my-1 flex h-14 items-center pl-5">
				<span className="absolute inset-y-0 left-5 w-px bg-border" />
				<motion.span
					key={sampleIndex}
					aria-hidden="true"
					initial={{ top: "0%", opacity: 0 }}
					animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
					transition={{ duration: 0.9, ease: EASE_OUT }}
					className="absolute left-5 size-1.5 -translate-x-[2.5px] rounded-full bg-primary"
				/>
				<span className="ml-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary">
					<KeyRound className="size-3" />
					AES-256-GCM · key never leaves
				</span>
			</div>

			<div className="flex items-center gap-2 text-xs text-subtle">
				<Cloud className="size-3.5" />
				What reaches our servers
			</div>
			<div className="mt-2.5 flex h-11 items-center rounded-lg px-3.5 ring-1 ring-border ring-inset">
				<span className="truncate font-mono text-sm tracking-tight text-muted-foreground">
					{cipher}
				</span>
			</div>
		</div>
	);
};

export { EncryptionDemo };
