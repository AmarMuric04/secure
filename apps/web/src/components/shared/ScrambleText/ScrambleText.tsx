import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const FRAME_MS = 40;
const GLYPHS =
	"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#$%&*+=?@";

const scrambleTowards = ({
	target,
	settledCount,
}: {
	target: string;
	settledCount: number;
}) =>
	Array.from(target, (character, index) => {
		if (index < settledCount || character === " ") {
			return character;
		}

		return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
	}).join("");

const ScrambleText: React.FC<{
	text: string;
	className?: string;
	delayMs?: number;
	durationMs?: number;
}> = ({ text, className, delayMs = 0, durationMs = 500 }) => {
	const isReducedMotion = useReducedMotion();

	const [display, setDisplay] = useState(text);

	useEffect(() => {
		if (isReducedMotion) {
			setDisplay(text);

			return;
		}

		const startedAt = performance.now() + delayMs;

		setDisplay(scrambleTowards({ target: text, settledCount: 0 }));

		const interval = window.setInterval(() => {
			const progress = Math.max(
				0,
				(performance.now() - startedAt) / durationMs,
			);
			const settledCount = Math.floor(progress * text.length);

			setDisplay(scrambleTowards({ target: text, settledCount }));

			if (settledCount >= text.length) {
				window.clearInterval(interval);
			}
		}, FRAME_MS);

		return () => window.clearInterval(interval);
	}, [text, delayMs, durationMs, isReducedMotion]);

	return (
		<span className={cn("relative inline-block", className)}>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" className="invisible">
				{text}
			</span>
			<span aria-hidden="true" className="absolute inset-0">
				{display}
			</span>
		</span>
	);
};

export { ScrambleText };
