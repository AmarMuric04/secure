import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { EASE_OUT } from "@/lib/motion";

const TAGLINES = [
	"Encrypted on your device, before anything leaves it.",
	"We store ciphertext. Only you hold the key.",
	"One master password. Every secret, sealed.",
];
const ROTATE_MILLISECONDS = 5_200;

const RotatingTagline: React.FC = () => {
	const isReducedMotion = useReducedMotion();
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (isReducedMotion) {
			return;
		}

		const interval = window.setInterval(
			() => setIndex((current) => (current + 1) % TAGLINES.length),
			ROTATE_MILLISECONDS,
		);

		return () => window.clearInterval(interval);
	}, [isReducedMotion]);

	return (
		<div className="relative h-16 max-w-md overflow-hidden">
			<AnimatePresence mode="wait" initial={false}>
				<motion.p
					key={index}
					initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
					transition={{ duration: 0.45, ease: EASE_OUT }}
					className="text-2xl leading-snug font-semibold tracking-tight text-balance text-foreground"
				>
					{TAGLINES[index]}
				</motion.p>
			</AnimatePresence>
		</div>
	);
};

export { RotatingTagline };
