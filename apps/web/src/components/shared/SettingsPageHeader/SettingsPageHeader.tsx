const SettingsPageHeader: React.FC<{ title: string; description: string }> = ({
	title,
	description,
}) => {
	return (
		<header className="mb-10">
			<h1 className="text-[1.75rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-[2rem]">
				{title}
			</h1>
			<p className="mt-2 text-pretty text-muted-foreground">
				{description}
			</p>
		</header>
	);
};

export { SettingsPageHeader };
