import { Skeleton } from "@/components/ui";

const AnalyticsSkeleton: React.FC = () => {
	return (
		<>
			<div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
				<Skeleton className="h-40 rounded-xl" />
				<div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3 lg:self-end">
					<Skeleton className="h-24 rounded-md" />
					<Skeleton className="h-24 rounded-md" />
					<Skeleton className="h-24 rounded-md" />
				</div>
			</div>

			<div className="grid gap-3 lg:grid-cols-2">
				<Skeleton className="h-64 rounded-xl" />
				<Skeleton className="h-64 rounded-xl" />
			</div>
		</>
	);
};

export { AnalyticsSkeleton };
