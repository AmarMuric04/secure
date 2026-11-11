import { Link } from "@tanstack/react-router";
import {
	type decryptVault,
	readEntryIssue,
	readIssueSeverity,
	secure,
} from "business-logic-secure";
import { Star } from "lucide-react";
import { motion } from "motion/react";

import { VaultEntryAvatar } from "@/components/shared/VaultEntryAvatar";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SEVERITY_DOTS = {
	urgent: "bg-destructive",
	warning: "bg-warning",
	notice: "bg-subtle",
};

const VaultListRow: React.FC<{
	entry: Awaited<ReturnType<typeof decryptVault>>["passwords"][number];
	isSelected: boolean;
}> = ({ entry, isSelected }) => {
	const audit = secure.vault.useVaultAudit();

	const issue = readEntryIssue({ audit: audit.data, id: entry.id });
	const severity = issue ? readIssueSeverity(issue) : null;

	return (
		<Link
			to="/vault"
			search={(previous) => ({ ...previous, entry: entry.id })}
			data-selected={isSelected}
			className={cn(
				"relative flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-200",
				!isSelected && "hover:bg-muted",
			)}
		>
			{isSelected && (
				<motion.span
					layoutId="vault-row-selection"
					transition={{ duration: 0.3, ease: EASE_OUT }}
					className="absolute inset-0 rounded-lg bg-accent"
				/>
			)}
			<VaultEntryAvatar entry={entry} size="md" className="relative" />
			<span className="relative min-w-0 flex-1">
				<span className="block truncate font-medium">
					{entry.title}
				</span>
				<span className="block truncate text-[13px] text-subtle">
					{entry.username || "No username"}
				</span>
			</span>
			<span className="relative flex items-center gap-1.5 text-subtle">
				{severity && severity !== "suggestion" && (
					<span
						title="Needs attention"
						className={cn(
							"size-1.75 rounded-full",
							SEVERITY_DOTS[severity],
						)}
					/>
				)}
				{entry.favorite && <Star className="size-3.25 fill-current" />}
			</span>
		</Link>
	);
};

export { VaultListRow };
