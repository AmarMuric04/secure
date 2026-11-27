import { SectionHeading } from "../SectionHeading";

const LIMITS = [
	{
		statement: "We can’t read your vault.",
		detail: "Our database holds ciphertext like the line in the demo above, plus the category, tags and favourite flag you set.",
	},
	{
		statement: "We can’t reset your master password.",
		detail: "No recovery key exists on our side. If you forget it, the vault stays sealed, so choose one you’ll remember.",
	},
];

const LimitsSection: React.FC = () => {
	return (
		<section
			id="by-design"
			className="mx-auto max-w-6xl scroll-mt-6 px-5 pt-28 sm:px-8 lg:pt-40"
		>
			<SectionHeading title="Some things we simply can’t do for you." />

			<ol className="mt-14 sm:mt-16">
				{LIMITS.map((limit) => (
					<li
						key={limit.statement}
						className="grid gap-x-16 gap-y-2 border-t border-foreground/15 py-7 last:border-b md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
					>
						<p className="text-xl font-medium tracking-tight sm:text-2xl">
							{limit.statement}
						</p>
						<p className="text-[15px] leading-relaxed text-pretty text-muted-foreground md:pt-1">
							{limit.detail}
						</p>
					</li>
				))}
			</ol>
		</section>
	);
};

export { LimitsSection };
