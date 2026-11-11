import { Skeleton } from "@/components/ui";

const PLACEHOLDER_KEYS = [1, 2, 3, 4, 5, 6];

const FoldersSkeleton: React.FC = () => {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{PLACEHOLDER_KEYS.map((key) => (
				<div key={key} className="relative h-52">
					<Skeleton className="absolute top-0 left-0 h-7 w-24 rounded-t-xl rounded-b-none" />
					<Skeleton className="absolute inset-x-0 top-5 bottom-0 rounded-xl rounded-tl-none" />
				</div>
			))}
		</div>
	);
};

export { FoldersSkeleton };
