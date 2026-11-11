import { Skeleton } from "@/components/ui";

const ROW_KEYS = [0, 1, 2, 3, 4];

const TrashSkeleton: React.FC = () => {
	return (
		<div>
			<div className="flex items-center gap-3 py-3">
				<div className="flex w-8 justify-center">
					<Skeleton className="size-2 rounded-full" />
				</div>
				<Skeleton className="h-3.5 w-16" />
			</div>

			{ROW_KEYS.map((key) => (
				<div key={key} className="flex items-center gap-3 py-1">
					<div className="flex w-8 justify-center">
						<Skeleton className="size-7 rounded-full" />
					</div>
					<div className="flex flex-1 items-center gap-3 px-3 py-2">
						<Skeleton className="size-9 rounded-[11px]" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-4 w-36" />
							<Skeleton className="h-3.5 w-48" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export { TrashSkeleton };
