const INVALID_PREVIEW_LIMIT = 5;

const SummaryFigure: React.FC<{ value: number; label: string }> = ({
	value,
	label,
}) => {
	return (
		<div>
			<p className="font-mono text-2xl tracking-tight tabular-nums">
				{value}
			</p>
			<p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
		</div>
	);
};

const ImportSummary: React.FC<{
	freshCount: number;
	duplicateCount: number;
	invalid: { rowNumber: number; reason: string }[];
}> = ({ freshCount, duplicateCount, invalid }) => {
	const hiddenCount = invalid.length - INVALID_PREVIEW_LIMIT;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-3 gap-4 border-y border-border py-4">
				<SummaryFigure value={freshCount} label="New" />
				<SummaryFigure
					value={duplicateCount}
					label="Already in vault"
				/>
				<SummaryFigure value={invalid.length} label="Skipped" />
			</div>

			{invalid.length > 0 && (
				<ul className="space-y-1 text-[13px] text-muted-foreground">
					{invalid.slice(0, INVALID_PREVIEW_LIMIT).map((row) => (
						<li key={row.rowNumber}>
							<span className="font-mono text-subtle">
								Row {row.rowNumber}
							</span>{" "}
							· {row.reason}
						</li>
					))}
					{hiddenCount > 0 && (
						<li className="text-subtle">and {hiddenCount} more</li>
					)}
				</ul>
			)}
		</div>
	);
};

export { ImportSummary };
