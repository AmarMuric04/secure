import { Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";

import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Button, EmptyState, Skeleton } from "@/components/ui";

const SKELETON_FIELDS = ["username", "password", "website", "category"];

const PasswordEntryFallback: React.FC<{
	isPending: boolean;
	error: Error | null;
	onRetry: () => void;
}> = ({ isPending, error, onRetry }) => {
	if (isPending) {
		return (
			<div aria-busy="true" aria-label="Loading password">
				<div className="mb-8 flex items-center justify-between">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-9 w-40 rounded-lg" />
				</div>
				<div className="grid gap-14 xl:grid-cols-[minmax(0,1fr)_21rem]">
					<div className="pl-4">
						<Skeleton className="mb-3 h-3.5 w-16" />
						<div className="flex items-center gap-4">
							<Skeleton className="size-14 rounded-2xl" />
							<Skeleton className="h-8 w-64" />
						</div>
						<div className="mt-8 border-t border-border">
							{SKELETON_FIELDS.map((field) => (
								<div
									key={field}
									className="flex items-center gap-4 border-b border-border py-4"
								>
									<Skeleton className="h-3.5 w-24" />
									<Skeleton className="h-4 flex-1" />
								</div>
							))}
						</div>
					</div>
					<Skeleton className="hidden h-44 rounded-2xl xl:block" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<QueryErrorState
				title="Could not load your vault"
				message={error.message}
				onRetry={onRetry}
			/>
		);
	}

	return (
		<EmptyState
			icon={<KeyRound />}
			title="Password not found"
			description="It may have been deleted or moved to the trash."
			action={
				<Button asChild variant="outline">
					<Link to="/vault">Back to vault</Link>
				</Button>
			}
		/>
	);
};

export { PasswordEntryFallback };
