const SettingsSection: React.FC<{
	title: string;
	description?: string;
	footer?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}> = ({ title, description, footer, className, children }) => {
	return (
		<section className={className}>
			<h2 className="text-lg font-medium tracking-[-0.02em] text-foreground">
				{title}
			</h2>
			{description && (
				<p className="mt-0.5 text-sm text-muted-foreground">
					{description}
				</p>
			)}
			<div className="mt-4 divide-y divide-border border-t border-b border-t-foreground/15 border-b-border">
				{children}
			</div>
			{footer && (
				<div className="mt-4 flex items-center justify-end gap-2">
					{footer}
				</div>
			)}
		</section>
	);
};

export { SettingsSection };
