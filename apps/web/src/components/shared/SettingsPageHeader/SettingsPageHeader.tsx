const SettingsPageHeader: React.FC<{ title: string; description: string }> = ({
	title,
	description,
}) => {
	return (
		<header className="mb-8">
			<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
			<p className="mt-1 text-muted-foreground">{description}</p>
		</header>
	);
};

export { SettingsPageHeader };
