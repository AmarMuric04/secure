import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { CombinationDial } from "@/components/shared/CombinationDial";

const SAMPLE_PHRASES = [
	"correct-horse-battery-staple",
	"my bank PIN is 4821",
	"wifi: SunnyAttic_5G",
];
const TYPE_INTERVAL_MS = 85;
const HOLD_MS = 2_400;
const OPEN_MS = 1_400;

const HeroDial: React.FC<{
	dialRef: React.RefObject<HTMLDivElement | null>;
	phrase: string;
	isEdited: boolean;
	onAutoType: (phrase: string) => void;
	onEdit: (phrase: string) => void;
	onSeal: () => void;
}> = ({ dialRef, phrase, isEdited, onAutoType, onEdit, onSeal }) => {
	const isReducedMotion = useReducedMotion();

	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (isEdited || isReducedMotion) {
			return;
		}

		let phraseIndex = 0;
		let length = 0;
		let timeout = 0;

		const typeNext = () => {
			const sample = SAMPLE_PHRASES[phraseIndex] ?? "";

			length += 1;
			onAutoType(sample.slice(0, length));

			if (length < sample.length) {
				timeout = window.setTimeout(typeNext, TYPE_INTERVAL_MS);

				return;
			}

			timeout = window.setTimeout(() => {
				phraseIndex = (phraseIndex + 1) % SAMPLE_PHRASES.length;
				length = 0;
				typeNext();
			}, HOLD_MS);
		};

		timeout = window.setTimeout(typeNext, 700);

		return () => window.clearTimeout(timeout);
	}, [isEdited, isReducedMotion, onAutoType]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const timeout = window.setTimeout(() => setIsOpen(false), OPEN_MS);

		return () => window.clearTimeout(timeout);
	}, [isOpen]);

	const handleFocus = () => {
		if (isEdited) {
			return;
		}

		onEdit("");
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onEdit(event.target.value);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter" || !phrase) {
			return;
		}

		setIsOpen(true);
		onSeal();
	};

	return (
		<div className="flex flex-col items-center">
			<div ref={dialRef}>
				<CombinationDial
					length={phrase.length}
					status={isOpen ? "open" : "idle"}
					className="size-48 sm:size-60 lg:size-68"
				/>
			</div>

			<label
				htmlFor="hero-secret"
				className="mt-14 w-full max-w-xs text-xs text-subtle"
			>
				Try it: type a secret, then press Enter
			</label>
			<input
				id="hero-secret"
				value={phrase}
				maxLength={64}
				autoComplete="off"
				spellCheck={false}
				placeholder="Type anything"
				onFocus={handleFocus}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				className="mt-2 h-11 w-full max-w-xs border-b border-input bg-transparent font-mono text-[15px] transition-colors outline-none placeholder:font-sans placeholder:text-subtle focus:border-primary"
			/>
		</div>
	);
};

export { HeroDial };
