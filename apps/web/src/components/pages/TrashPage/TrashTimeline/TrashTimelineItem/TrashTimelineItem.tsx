import {
	type decryptVault,
	readPurgeCountdown,
	toWebsiteLink,
} from "business-logic-secure";
import { formatRelativeTime } from "formatting-service";
import { motion } from "motion/react";

import { VaultEntryAvatar } from "@/components/shared/VaultEntryAvatar";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { PurgeCountdownNode } from "./PurgeCountdownNode";
import { TrashItemActions } from "./TrashItemActions";

const TrashTimelineItem: React.FC<{
	entry: Awaited<ReturnType<typeof decryptVault>>["passwords"][number];
	order: number;
	isSelected: boolean;
	isSelectionMode: boolean;
	isLast: boolean;
	onToggleSelected: (id: string) => void;
	ref?: React.Ref<HTMLLIElement>;
}> = ({
	entry,
	order,
	isSelected,
	isSelectionMode,
	isLast,
	onToggleSelected,
	ref,
}) => {
	const countdown = readPurgeCountdown(entry.deletedAt);
	const hostname = toWebsiteLink(entry.url)?.hostname;
	const details = [entry.username || "No username", hostname].filter(Boolean);
	const purgeLabel =
		countdown.daysLeft === 0
			? "Removed today"
			: `${countdown.daysLeft} day${countdown.daysLeft === 1 ? "" : "s"} left`;

	return (
		<motion.li
			ref={ref}
			layout
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -32, transition: { duration: 0.25 } }}
			transition={{
				duration: 0.4,
				ease: EASE_OUT,
				delay: Math.min(order, 12) * 0.035,
			}}
			className="group flex gap-3"
		>
			<div className="flex w-8 shrink-0 flex-col items-center">
				<span className="h-2.5 w-px bg-border" />
				<PurgeCountdownNode
					title={entry.title}
					daysLeft={countdown.daysLeft}
					ratio={countdown.ratio}
					isUrgent={countdown.isUrgent}
					isSelected={isSelected}
					isSelectionMode={isSelectionMode}
					onToggle={() => onToggleSelected(entry.id)}
				/>
				<span className={cn("w-px flex-1", !isLast && "bg-border")} />
			</div>

			<div
				className={cn(
					"my-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-200",
					isSelected ? "bg-primary-soft" : "group-hover:bg-muted",
				)}
			>
				<span className="opacity-55 grayscale">
					<VaultEntryAvatar entry={entry} />
				</span>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-muted-foreground line-through decoration-subtle/50">
						{entry.title}
					</p>
					<p className="truncate text-[13px] text-subtle">
						{details.join(" · ")}
					</p>
				</div>

				<div className="hidden shrink-0 text-right text-xs md:block">
					<p className="text-subtle">
						{entry.deletedAt
							? formatRelativeTime(entry.deletedAt)
							: "Recently"}
					</p>
					<p
						className={cn(
							"tabular-nums",
							countdown.isUrgent
								? "text-warning"
								: "text-muted-foreground",
						)}
					>
						{purgeLabel}
					</p>
				</div>

				<TrashItemActions id={entry.id} title={entry.title} />
			</div>
		</motion.li>
	);
};

export { TrashTimelineItem };
