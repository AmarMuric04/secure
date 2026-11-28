import { Skeleton } from "@/components/ui";

const PLACEHOLDER_KEYS = [1, 2, 3, 4, 5];

const CategoriesSkeleton: React.FC = () => {
	return (
		<div className="divide-y divide-border border-t border-foreground/15">
			{PLACEHOLDER_KEYS.map((key) => (
				<div key={key} className="flex items-center gap-4 py-4">
					<Skeleton className="size-9 rounded-[11px]" />
					<div className="flex-1 space-y-1.5">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3.5 w-56" />
					</div>
				</div>
			))}
		</div>
	);
};

export { CategoriesSkeleton };
