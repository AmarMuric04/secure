import type {
	buildSecurityInbox,
	SECURITY_FILTER_KEYS,
} from "business-logic-secure";
import { AnimatePresence, motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

import { FILTER_DETAILS } from "../issueDetails";
import { SecurityAllClear } from "../SecurityAllClear";
import { SecurityIssueRow } from "../SecurityIssueRow";

const ALL_ISSUES_DETAILS = {
	title: "Everything that needs attention",
	hint: "Start with breached passwords, then weak and reused ones, then old ones.",
};

const SecurityInboxList: React.FC<{
	issue: (typeof SECURITY_FILTER_KEYS)[number] | undefined;
	entries: ReturnType<typeof buildSecurityInbox>["entries"];
}> = ({ issue, entries }) => {
	const details = issue ? FILTER_DETAILS[issue] : ALL_ISSUES_DETAILS;

	return (
		<section aria-label={details.title} className="min-w-0">
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={issue ?? "all"}
					initial={{ opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -4 }}
					transition={{ duration: 0.18, ease: EASE_OUT }}
					className="border-b border-border pb-3"
				>
					<h2 className="font-semibold tracking-tight">
						{details.title}
					</h2>
					<p className="mt-0.5 text-[13px] text-subtle">
						{details.hint}
					</p>
				</motion.div>
			</AnimatePresence>

			{entries.length === 0 ? (
				<SecurityAllClear isFiltered={!!issue} />
			) : (
				<ul key={issue ?? "all"}>
					<AnimatePresence>
						{entries.map((item, index) => (
							<SecurityIssueRow
								key={item.entry.id}
								item={item}
								index={index}
							/>
						))}
					</AnimatePresence>
				</ul>
			)}
		</section>
	);
};

export { SecurityInboxList };
