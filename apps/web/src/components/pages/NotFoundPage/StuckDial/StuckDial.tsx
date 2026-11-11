import { motion, useReducedMotion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

const CENTER = 80;
const TICKS = Array.from({ length: 48 }, (_, index) => {
	const angle = (index * 7.5 * Math.PI) / 180;
	const isMajor = index % 4 === 0;
	const innerRadius = isMajor ? 60 : 65;

	return {
		index,
		isMajor,
		x1: CENTER + 70 * Math.sin(angle),
		y1: CENTER - 70 * Math.cos(angle),
		x2: CENTER + innerRadius * Math.sin(angle),
		y2: CENTER - innerRadius * Math.cos(angle),
	};
});

const StuckDial: React.FC = () => {
	const isReducedMotion = useReducedMotion();

	return (
		<div className="relative size-40">
			<span className="absolute inset-0 rounded-full shadow-pop" />
			<svg
				viewBox="0 0 160 160"
				aria-hidden="true"
				className="relative size-full overflow-visible"
			>
				<circle cx={CENTER} cy={CENTER} r="76" className="fill-card" />
				<motion.g
					style={{ originX: "50%", originY: "50%" }}
					animate={
						isReducedMotion
							? undefined
							: { rotate: [0, 220, 160, 300, 286, 292, 288, 0] }
					}
					transition={{
						duration: 4.2,
						times: [0, 0.22, 0.36, 0.55, 0.62, 0.68, 0.74, 1],
						ease: EASE_OUT,
						repeat: Infinity,
						repeatDelay: 1.2,
					}}
				>
					{TICKS.map((tick) => (
						<line
							key={tick.index}
							x1={tick.x1}
							y1={tick.y1}
							x2={tick.x2}
							y2={tick.y2}
							strokeWidth={tick.isMajor ? 1.6 : 1}
							strokeLinecap="round"
							className={
								tick.isMajor ? "stroke-subtle" : "stroke-input"
							}
						/>
					))}
					<circle
						cx={CENTER}
						cy="30"
						r="3"
						className="fill-primary"
					/>
				</motion.g>
				<circle
					cx={CENTER}
					cy={CENTER}
					r="38"
					className="fill-muted stroke-border"
				/>
				<text
					x={CENTER}
					y={CENTER}
					textAnchor="middle"
					dominantBaseline="central"
					className="fill-foreground font-mono text-[22px] font-medium"
				>
					404
				</text>
				<motion.path
					d="M73.5 -3h13L80 5z"
					animate={
						isReducedMotion
							? undefined
							: {
									x: [0, 0, -2.5, 2.5, -1.5, 0, 0],
								}
					}
					transition={{
						duration: 4.2,
						times: [0, 0.6, 0.63, 0.66, 0.69, 0.72, 1],
						repeat: Infinity,
						repeatDelay: 1.2,
					}}
					className="fill-destructive"
				/>
			</svg>
		</div>
	);
};

export { StuckDial };
