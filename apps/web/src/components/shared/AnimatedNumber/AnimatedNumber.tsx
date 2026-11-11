import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { EASE_OUT } from "@/lib/motion";

const AnimatedNumber: React.FC<{
	value: number;
	duration?: number;
	className?: string;
}> = ({ value, duration = 0.9, className }) => {
	const isReducedMotion = useReducedMotion();

	const [display, setDisplay] = useState(isReducedMotion ? value : 0);
	const previousRef = useRef(isReducedMotion ? value : 0);

	useEffect(() => {
		if (isReducedMotion) {
			previousRef.current = value;
			setDisplay(value);

			return;
		}

		const controls = animate(previousRef.current, value, {
			duration,
			ease: EASE_OUT,
			onUpdate: (latest) => {
				previousRef.current = latest;
				setDisplay(Math.round(latest));
			},
		});

		return () => controls.stop();
	}, [value, duration, isReducedMotion]);

	return <span className={className}>{display}</span>;
};

export { AnimatedNumber };
