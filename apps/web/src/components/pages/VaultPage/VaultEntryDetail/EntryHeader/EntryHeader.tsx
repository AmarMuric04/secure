import { Link } from "@tanstack/react-router";
import {
	secure,
	toWebsiteLink,
	type decryptVault,
} from "business-logic-secure";
import { ChevronLeft, Pencil, Star, Trash2 } from "lucide-react";

import { VaultEntryAvatar } from "@/components/shared/VaultEntryAvatar";
import { Button, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

const EntryHeader: React.FC<{
	entry: Awaited<ReturnType<typeof decryptVault>>["passwords"][number];
	onDelete: () => void;
}> = ({ entry, onDelete }) => {
	const { addToast } = useToast();
	const updatePassword = secure.vault.useUpdatePassword();

	const websiteLink = toWebsiteLink(entry.url);

	const handleToggleFavorite = () => {
		updatePassword.mutate(
			{ ...entry, favorite: !entry.favorite },
			{
				onError: (error) =>
					addToast({
						type: "error",
						title: "Could not update favorite",
						message: error.message,
					}),
			},
		);
	};

	return (
		<>
			<Button
				asChild
				variant="ghost"
				size="icon"
				className="mb-3 -ml-2 rounded-lg md:hidden"
			>
				<Link
					to="/vault"
					search={(previous) => ({ ...previous, entry: undefined })}
					aria-label="Back to list"
				>
					<ChevronLeft className="size-5" />
				</Link>
			</Button>

			<div className="mb-7 flex items-center gap-4">
				<VaultEntryAvatar entry={entry} size="lg" />

				<div className="min-w-0 flex-1">
					<h2 className="truncate text-2xl leading-tight font-semibold tracking-tight">
						{entry.title}
					</h2>
					{websiteLink && (
						<p className="mt-0.5 truncate text-[13px] text-subtle">
							{websiteLink.hostname}
						</p>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						aria-pressed={entry.favorite}
						aria-label={
							entry.favorite
								? "Remove from favorites"
								: "Add to favorites"
						}
						disabled={updatePassword.isPending}
						className="rounded-lg text-muted-foreground"
						onClick={handleToggleFavorite}
					>
						<Star
							className={cn(
								entry.favorite &&
									"fill-current text-foreground",
							)}
						/>
					</Button>

					<Button
						variant="ghost"
						size="icon"
						aria-label="Move to trash"
						className="rounded-lg text-muted-foreground"
						onClick={onDelete}
					>
						<Trash2 />
					</Button>

					<Button
						asChild
						variant="outline"
						size="sm"
						className="ml-1 rounded-lg bg-muted shadow-none dark:bg-muted"
					>
						<Link to="/vault/$id/edit" params={{ id: entry.id }}>
							<Pencil className="size-3.5" />
							Edit
						</Link>
					</Button>
				</div>
			</div>
		</>
	);
};

export { EntryHeader };
