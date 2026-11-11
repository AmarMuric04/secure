import { Link } from "@tanstack/react-router";
import {
	type buildSecurityInbox,
	readEntryHostname,
} from "business-logic-secure";
import { formatDate, formatRelativeTime } from "formatting-service";
import { Wrench } from "lucide-react";
import { motion } from "motion/react";

import { VaultEntryAvatar } from "@/components/shared/VaultEntryAvatar";
import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { ISSUE_LABELS } from "../issueDetails";

const RelatedEntries: React.FC<{
	related: ReturnType<
		typeof buildSecurityInbox
	>["entries"][number]["related"];
}> = ({ related }) => {
	return (
		<p className="mt-1 truncate text-[12.5px] text-subtle">
			Compare with{" "}
			{related.map((relatedEntry, index) => (
				<span key={relatedEntry.id}>
					{index > 0 && ", "}
					<Link
						to="/vault"
						search={{ entry: relatedEntry.id }}
						className="text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
					>
						{relatedEntry.title}
					</Link>
				</span>
			))}
		</p>
	);
};

const SecurityIssueRow: React.FC<{
	item: ReturnType<typeof buildSecurityInbox>["entries"][number];
	index: number;
}> = ({ item, index }) => {
	const { entry, issues, siteBreach, related } = item;

	const hostname = readEntryHostname(entry.url);
	const details = [entry.username || "No username", hostname].filter(Boolean);

	return (
		<motion.li
			layout
			initial={{ opacity: 0, y: 8 }}
			animate={{
				opacity: 1,
				y: 0,
				transition: {
					duration: 0.35,
					delay: Math.min(index, 10) * 0.03,
					ease: EASE_OUT,
				},
			}}
			exit={{
				opacity: 0,
				x: 24,
				transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
			}}
			className="group flex items-center gap-3 border-b border-border py-3 last:border-b-0"
		>
			<div className="flex min-w-0 flex-1 items-center gap-3.5">
				<VaultEntryAvatar entry={entry} />
				<div className="min-w-0 flex-1">
					<Link
						to="/vault"
						search={{ entry: entry.id }}
						className="block truncate rounded-sm text-sm font-medium outline-none hover:underline hover:decoration-border hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
					>
						{entry.title}
					</Link>
					<p className="truncate text-[13px] text-subtle">
						{details.join(" · ")}
						<span className="hidden lg:inline">
							{" "}
							· password changed{" "}
							{formatRelativeTime(
								entry.passwordChangedAt ?? entry.createdAt,
							)}
						</span>
					</p>
					{siteBreach && (
						<p className="mt-1 truncate text-[12.5px] text-destructive">
							{siteBreach.title} was breached on{" "}
							{formatDate(siteBreach.breachDate)}, after your last
							change
						</p>
					)}
					{related.length > 0 && <RelatedEntries related={related} />}
				</div>
			</div>

			<div className="hidden max-w-56 shrink-0 flex-wrap justify-end gap-1 sm:flex">
				{issues.map((issue) => (
					<span
						key={issue}
						className={cn(
							"inline-flex h-5.5 items-center rounded-full px-2 text-[11px] font-medium whitespace-nowrap",
							ISSUE_LABELS[issue].pill,
						)}
					>
						{ISSUE_LABELS[issue].label}
					</span>
				))}
			</div>

			<Button asChild variant="outline" size="sm" className="shrink-0">
				<Link to="/vault/$id/edit" params={{ id: entry.id }}>
					<Wrench />
					Fix
				</Link>
			</Button>
		</motion.li>
	);
};

export { SecurityIssueRow };
