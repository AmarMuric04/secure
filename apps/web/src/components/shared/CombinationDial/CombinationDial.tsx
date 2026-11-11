import { cn } from "@/lib/utils";

const CENTER = 66;
const TICKS = Array.from({ length: 60 }, (_, index) => {
	const angle = (index * 6 * Math.PI) / 180;
	const isMajor = index % 5 === 0;
	const innerRadius = isMajor ? 49 : 53;

	return {
		index,
		isMajor,
		x1: CENTER + 57 * Math.sin(angle),
		y1: CENTER - 57 * Math.cos(angle),
		x2: CENTER + innerRadius * Math.sin(angle),
		y2: CENTER - innerRadius * Math.cos(angle),
		labelX: CENTER + 41 * Math.sin(angle),
		labelY: CENTER - 41 * Math.cos(angle),
	};
});

const toDialAngle = (length: number) =>
	Array.from({ length }, (_, index) => index).reduce(
		(angle, index) =>
			angle +
			(Math.floor(index / 4) % 2 ? -1 : 1) * (18 + ((index * 37) % 29)),
		0,
	);

const toOpenAngle = (angle: number) => Math.ceil(angle / 360) * 360 + 360;

const CombinationDial: React.FC<{
	length: number;
	status: "idle" | "error" | "open";
	className?: string;
}> = ({ length, status, className }) => {
	const angle = toDialAngle(length);
	const isOpen = status === "open";

	return (
		<div
			className={cn(
				"relative size-33 before:absolute before:-inset-3 before:rounded-full before:border before:border-border",
				className,
			)}
		>
			<span className="absolute inset-1.5 rounded-full shadow-pop" />
			<svg
				viewBox="0 0 132 132"
				aria-hidden="true"
				className="relative size-full overflow-visible"
			>
				<circle cx={CENTER} cy={CENTER} r="60" className="fill-card" />
				<g
					style={{
						transform: `rotate(${isOpen ? toOpenAngle(angle) : angle}deg)`,
						transformOrigin: `${CENTER}px ${CENTER}px`,
					}}
					className={cn(
						"motion-safe:transition-transform",
						isOpen
							? "duration-1000 ease-out-expo"
							: "duration-450 ease-out-quint",
					)}
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
							className={cn(
								"transition-colors duration-300",
								isOpen && "stroke-success",
								!isOpen &&
									(tick.isMajor
										? "stroke-subtle"
										: "stroke-input"),
							)}
						/>
					))}
					{TICKS.filter((tick) => tick.index % 10 === 0).map(
						(tick) => (
							<text
								key={tick.index}
								x={tick.labelX}
								y={tick.labelY}
								textAnchor="middle"
								dominantBaseline="central"
								transform={`rotate(${tick.index * 6} ${tick.labelX} ${tick.labelY})`}
								className={cn(
									"font-mono text-[7.5px] font-medium transition-colors duration-300",
									isOpen ? "fill-success" : "fill-subtle",
								)}
							>
								{tick.index}
							</text>
						),
					)}
					<circle
						cx={CENTER}
						cy={CENTER}
						r="30"
						className="fill-muted stroke-border"
					/>
					<circle
						cx={CENTER}
						cy="42"
						r="2.6"
						className={cn(
							"transition-colors duration-300",
							isOpen ? "fill-success" : "fill-primary",
						)}
					/>
				</g>
				<path
					d="M60.5 -2h11L66 5z"
					className={cn(
						"transition-colors duration-200",
						isOpen && "fill-success",
						status === "error" && "fill-destructive",
						status === "idle" && "fill-primary",
					)}
				/>
				<g
					className={cn(
						"transition-colors duration-300",
						isOpen ? "text-success" : "text-muted-foreground",
					)}
				>
					<g
						style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
						className={cn(
							"transition-[opacity,transform] duration-300 ease-pop",
							isOpen && "scale-50 opacity-0",
						)}
					>
						<circle
							cx={CENTER}
							cy="62.5"
							r="4.4"
							fill="currentColor"
						/>
						<path
							d="M64.2 65h3.6l1.1 8h-5.8z"
							fill="currentColor"
						/>
					</g>
					<path
						d="M57 66.5l6 6L76 59.5"
						fill="none"
						stroke="currentColor"
						strokeWidth="3.2"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
						className={cn(
							"transition-[opacity,transform] duration-300 ease-pop",
							isOpen ? "opacity-100" : "scale-50 opacity-0",
						)}
					/>
				</g>
			</svg>
		</div>
	);
};

export { CombinationDial };
