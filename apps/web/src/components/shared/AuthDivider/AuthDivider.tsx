const AuthDivider: React.FC<{ label: string }> = ({ label }) => {
	return (
		<div className="flex items-center gap-3 text-xs text-subtle">
			<span className="h-px flex-1 bg-foreground/15" />
			{label}
			<span className="h-px flex-1 bg-foreground/15" />
		</div>
	);
};

export { AuthDivider };
