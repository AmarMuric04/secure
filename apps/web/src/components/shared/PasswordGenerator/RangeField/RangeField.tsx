const RangeField: React.FC<{
	id: string;
	label: string;
	min: number;
	max: number;
	value: number;
	onChange: (value: number) => void;
}> = ({ id, label, min, max, value, onChange }) => {
	const fill = `${((value - min) / (max - min)) * 100}%`;

	return (
		<div className="flex items-center gap-4">
			<label
				htmlFor={id}
				className="w-17 shrink-0 text-[13px] font-medium text-muted-foreground"
			>
				{label}
			</label>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				style={{ "--fill": fill } as React.CSSProperties}
				className="h-5 flex-1 cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-card [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[linear-gradient(to_right,var(--primary)_var(--fill),var(--input)_var(--fill))] [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--primary)_var(--fill),var(--input)_var(--fill))] [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-card [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-primary/20 active:[&::-webkit-slider-thumb]:scale-115"
			/>
			<output
				htmlFor={id}
				className="w-8 shrink-0 text-right font-mono text-sm font-medium tabular-nums"
			>
				{value}
			</output>
		</div>
	);
};

export { RangeField };
