import { cn } from "@/lib/utils";

const SettingsRow: React.FC<{
	label: string;
	description?: string;
	labelId?: string;
	htmlFor?: string;
	isStacked?: boolean;
	children?: React.ReactNode;
}> = ({
	label,
	description,
	labelId,
	htmlFor,
	isStacked = false,
	children,
}) => {
	const Label = htmlFor ? "label" : "p";

	return (
		<div
			className={cn(
				"grid gap-x-8 gap-y-3 py-4",
				!isStacked &&
					"sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
			)}
		>
			<div className="min-w-0">
				<Label
					id={labelId}
					htmlFor={htmlFor}
					className={cn(
						"block text-sm font-medium text-foreground",
						htmlFor && "cursor-pointer",
					)}
				>
					{label}
				</Label>
				{description && (
					<p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
						{description}
					</p>
				)}
			</div>
			{children && (
				<div className="min-w-0 sm:justify-self-end">{children}</div>
			)}
		</div>
	);
};

export { SettingsRow };
