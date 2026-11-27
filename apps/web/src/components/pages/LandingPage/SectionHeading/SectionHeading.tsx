const SectionHeading: React.FC<{
	title: string;
	lede?: string;
}> = ({ title, lede }) => {
	return (
		<div className="max-w-3xl">
			<h2 className="text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-5xl">
				{title}
			</h2>
			{lede && (
				<p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
					{lede}
				</p>
			)}
		</div>
	);
};

export { SectionHeading };
