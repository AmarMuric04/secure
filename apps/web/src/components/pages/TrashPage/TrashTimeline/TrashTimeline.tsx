import type { decryptVault } from "business-logic-secure";
import { AnimatePresence, motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { TrashTimelineItem } from "./TrashTimelineItem";

const TrashTimeline: React.FC<{
	groups: {
		key: string;
		label: string;
		entries: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	}[];
	selectedIds: string[];
	onToggleSelected: (id: string) => void;
}> = ({ groups, selectedIds, onToggleSelected }) => {
	const isSelectionMode = selectedIds.length > 0;
	const lastEntryId = groups.at(-1)?.entries.at(-1)?.id;

	return (
		<div className="relative">
			<AnimatePresence initial={false} mode="popLayout">
				{groups.map((group, groupIndex) => (
					<motion.section
						key={group.key}
						layout
						exit={{ opacity: 0, transition: { duration: 0.2 } }}
						transition={{ duration: 0.4, ease: EASE_OUT }}
						aria-label={group.label}
					>
						<motion.div
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.35,
								ease: EASE_OUT,
								delay: groupIndex * 0.12,
							}}
							className="flex items-center gap-3"
						>
							<div className="flex w-8 shrink-0 flex-col items-center self-stretch">
								<span
									className={cn(
										"w-px flex-1",
										groupIndex > 0 && "bg-border",
									)}
								/>
								<span className="my-1 size-2 rounded-full bg-foreground/70" />
								<span className="w-px flex-1 bg-border" />
							</div>
							<h2 className="py-3 text-[13px] font-medium text-foreground">
								{group.label}
								<span className="ml-2 text-subtle tabular-nums">
									{group.entries.length}
								</span>
							</h2>
						</motion.div>

						<ul>
							<AnimatePresence mode="popLayout">
								{group.entries.map((entry, entryIndex) => (
									<TrashTimelineItem
										key={entry.id}
										entry={entry}
										order={groupIndex * 3 + entryIndex + 1}
										isSelected={selectedIds.includes(
											entry.id,
										)}
										isSelectionMode={isSelectionMode}
										isLast={entry.id === lastEntryId}
										onToggleSelected={onToggleSelected}
									/>
								))}
							</AnimatePresence>
						</ul>
					</motion.section>
				))}
			</AnimatePresence>
		</div>
	);
};

export { TrashTimeline };
