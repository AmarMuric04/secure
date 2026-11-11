import { Skeleton } from "@/components/ui";

const ROW_KEYS = [0, 1, 2, 3];
const FILTER_KEYS = [0, 1, 2, 3];

const SecuritySkeleton: React.FC = () => {
	return (
		<div aria-busy="true">
			<Skeleton className="h-3.5 w-16" />
			<Skeleton className="mt-2 h-8 w-56" />
			<Skeleton className="mt-5 h-2 w-full rounded-full" />

			<div className="mt-10 grid gap-6 md:grid-cols-[12.5rem_minmax(0,1fr)] md:gap-10">
				<div className="flex gap-1 md:flex-col">
					{FILTER_KEYS.map((key) => (
						<Skeleton
							key={key}
							className="h-9 w-28 rounded-lg md:w-full"
						/>
					))}
				</div>
				<div>
					<Skeleton className="h-5 w-60" />
					<Skeleton className="mt-2 h-3.5 w-80 max-w-full" />
					<div className="mt-3 border-t border-border">
						{ROW_KEYS.map((key) => (
							<div
								key={key}
								className="flex items-center gap-3.5 border-b border-border py-3"
							>
								<Skeleton className="size-9 rounded-[11px]" />
								<div className="flex-1 space-y-1.5">
									<Skeleton className="h-4 w-36" />
									<Skeleton className="h-3.5 w-48" />
								</div>
								<Skeleton className="h-8 w-16 rounded-md" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export { SecuritySkeleton };
