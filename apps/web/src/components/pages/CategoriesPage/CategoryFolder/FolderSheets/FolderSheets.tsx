import type { decryptVault } from "business-logic-secure";
import { motion } from "motion/react";

import { VaultEntryAvatar } from "@/components/shared/VaultEntryAvatar";

const SPRING = { type: "spring", stiffness: 320, damping: 24 } as const;
const SHEET_POSES = [
	{
		closed: { x: 0, y: 0, rotate: 0 },
		open: { x: 0, y: -26, rotate: 0 },
	},
	{
		closed: { x: -12, y: 6, rotate: -6 },
		open: { x: -46, y: -12, rotate: -14 },
	},
	{
		closed: { x: 12, y: 8, rotate: 6 },
		open: { x: 46, y: -10, rotate: 13 },
	},
];

const FolderSheets: React.FC<{
	entries: Awaited<ReturnType<typeof decryptVault>>["passwords"];
	isOpen: boolean;
}> = ({ entries, isOpen }) => {
	if (entries.length === 0) {
		return (
			<motion.div
				animate={isOpen ? { y: -10 } : { y: 0 }}
				transition={SPRING}
				className="absolute inset-x-[22%] top-9 h-20 rounded-lg border border-dashed border-input bg-card/60"
			/>
		);
	}

	return (
		<div className="absolute inset-x-[18%] top-8 h-24">
			{entries
				.map((entry, index) => ({ entry, pose: SHEET_POSES[index] }))
				.reverse()
				.map(({ entry, pose }) => (
					<motion.div
						key={entry.id}
						initial={false}
						animate={isOpen ? pose?.open : pose?.closed}
						transition={SPRING}
						className="absolute inset-0 flex items-start gap-2 rounded-lg bg-card p-2.5 shadow-panel ring-1 ring-border"
					>
						<span className="origin-top-left scale-[0.8]">
							<VaultEntryAvatar entry={entry} />
						</span>
						<span className="min-w-0 flex-1 space-y-1.5 pt-1">
							<span className="block truncate text-[11px] font-medium">
								{entry.title}
							</span>
							<span className="block h-1 w-3/5 rounded-full bg-accent" />
						</span>
					</motion.div>
				))}
		</div>
	);
};

export { FolderSheets };
