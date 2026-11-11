const AuthDivider: React.FC<{ label: string }> = ({ label }) => {
	return (
		<div className="flex items-center gap-3 text-xs text-subtle">
			<span className="h-px flex-1 bg-linear-to-r from-transparent to-border" />
			{label}
			<span className="h-px flex-1 bg-linear-to-l from-transparent to-border" />
		</div>
	);
};

export { AuthDivider };
