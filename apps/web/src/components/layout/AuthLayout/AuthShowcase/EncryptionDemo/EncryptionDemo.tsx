import { Lock, LockOpen } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { siApple, siGithub, siSpotify } from "simple-icons";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { SampleIcon } from "./SampleIcon";

const SAMPLES = [
	{
		site: "GitHub",
		username: "octo-dev",
		secret: "correct-horse-battery",
		icon: siGithub,
	},
	{
		site: "Apple Account",
		username: "j.doe@icloud.com",
		secret: "Tr0pical!Mango#42",
		icon: siApple,
	},
	{
		site: "Spotify",
		username: "violet.sunrise",
		secret: "ledger-orbit-velvet-9",
		icon: siSpotify,
	},
];
const CIPHER_GLYPHS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const TICK_MILLISECONDS = 50;
const READABLE_TICKS = 34;
const SEALING_TICKS = 22;
const SEALED_TICKS = 40;
const CYCLE_TICKS = READABLE_TICKS + SEALING_TICKS + SEALED_TICKS;

const randomGlyph = () =>
	CIPHER_GLYPHS.charAt(Math.floor(Math.random() * CIPHER_GLYPHS.length));

const toCipher = (length: number) =>
	Array.from({ length }, randomGlyph).join("");

const EncryptionDemo: React.FC = () => {
	const isReducedMotion = useReducedMotion();

	const [sampleIndex, setSampleIndex] = useState(0);
	const [tick, setTick] = useState(0);
	const [cipher, setCipher] = useState(() =>
		toCipher(SAMPLES[0]?.secret.length ?? 0),
	);

	const sample = SAMPLES[sampleIndex] ?? SAMPLES[0];
	const secret = sample?.secret ?? "";
	const progress = Math.min(
		1,
		Math.max(0, (tick - READABLE_TICKS) / SEALING_TICKS),
	);
	const sealedCount = Math.floor(progress * secret.length);
	const isSealed = progress >= 1;
	const display = Array.from(secret, (character, index) =>
		index < sealedCount ? (cipher[index] ?? character) : character,
	).join("");

	useEffect(() => {
		if (isReducedMotion) {
			return;
		}

		const timeout = window.setTimeout(() => {
			if (tick + 1 < CYCLE_TICKS) {
				setTick(tick + 1);

				return;
			}

			const nextIndex = (sampleIndex + 1) % SAMPLES.length;

			setSampleIndex(nextIndex);
			setCipher(toCipher(SAMPLES[nextIndex]?.secret.length ?? 0));
			setTick(0);
		}, TICK_MILLISECONDS);

		return () => window.clearTimeout(timeout);
	}, [tick, sampleIndex, isReducedMotion]);

	return (
		<div className="w-[380px] rounded-2xl bg-card p-5 shadow-pop">
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={sample?.site}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -6 }}
					transition={{ duration: 0.3, ease: EASE_OUT }}
					className="flex items-center gap-3"
				>
					<SampleIcon icon={sample?.icon ?? siGithub} />
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium">{sample?.site}</p>
						<p className="truncate text-[13px] text-subtle">
							{sample?.username}
						</p>
					</div>
					<span
						className={cn(
							"grid size-8 place-items-center rounded-full transition-colors duration-300",
							isSealed
								? "bg-primary-soft text-primary"
								: "text-subtle",
						)}
					>
						{isSealed ? (
							<Lock className="size-4" />
						) : (
							<LockOpen className="size-4" />
						)}
					</span>
				</motion.div>
			</AnimatePresence>

			<div className="mt-5 border-t border-border pt-4">
				<p className="text-xs text-subtle">Password</p>
				<p className="mt-1.5 truncate font-mono text-[15px] tracking-tight">
					{Array.from(display, (character, index) => (
						<span
							key={index}
							className={cn(
								"transition-colors duration-300",
								index < sealedCount
									? "text-muted-foreground"
									: "text-foreground",
							)}
						>
							{character}
						</span>
					))}
				</p>

				<div className="mt-4 h-0.5 overflow-hidden rounded-full bg-accent">
					<div
						className="h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
						style={{ width: `${progress * 100}%` }}
					/>
				</div>

				<p className="mt-2.5 text-xs text-subtle">
					{isSealed
						? "AES-256-GCM. This is all our servers store."
						: "Readable only here, on your device."}
				</p>
			</div>
		</div>
	);
};

export { EncryptionDemo };
