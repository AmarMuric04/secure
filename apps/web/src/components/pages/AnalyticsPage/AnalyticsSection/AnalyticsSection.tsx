import { cn } from "@/lib/utils";

const AnalyticsSection: React.FC<{
	title: string;
	description?: string;
	className?: string;
	children: React.ReactNode;
}> = ({ title, description, className, children }) => {
	return (
		<section
			className={cn(
				"rounded-xl p-5 ring-1 ring-border sm:p-6",
				className,
			)}
		>
			<h2 className="font-semibold tracking-tight">{title}</h2>
			{description && (
				<p className="mt-0.5 text-[13px] text-subtle">{description}</p>
			)}
			<div className="mt-5">{children}</div>
		</section>
	);
};

export { AnalyticsSection };
