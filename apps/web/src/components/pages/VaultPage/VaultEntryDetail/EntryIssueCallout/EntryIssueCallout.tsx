import { Link } from "@tanstack/react-router";
import { readIssueSeverity, type SECURITY_ISSUES } from "business-logic-secure";
import { Info, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const ISSUE_MESSAGES = {
	compromised: {
		title: "Found in a data breach.",
		detail: "Change it now.",
	},
	siteBreached: {
		title: "This site was breached.",
		detail: "It happened after you last changed this password.",
	},
	weak: { title: "Weak password.", detail: "It is easy to guess." },
	personal: {
		title: "Contains a name.",
		detail: "It includes your username or the site's name.",
	},
	reused: {
		title: "Reused password.",
		detail: "Another entry uses the same one.",
	},
	similar: {
		title: "Similar password.",
		detail: "It is nearly the same as another of yours.",
	},
	stale: {
		title: "Due for a change.",
		detail: "This password has not been changed in a while.",
	},
	insecure: {
		title: "Insecure address.",
		detail: "The saved website uses http instead of https.",
	},
	duplicate: {
		title: "Possible duplicate.",
		detail: "Another entry has the same site and username.",
	},
	unused: {
		title: "Not used in a year.",
		detail: "Consider closing the account if you no longer need it.",
	},
};

const SEVERITY_STYLES = {
	urgent: "bg-destructive/10 text-destructive",
	warning: "bg-warning-soft text-warning",
	notice: "bg-muted text-muted-foreground ring-1 ring-border",
	suggestion: "bg-muted text-muted-foreground ring-1 ring-border",
};

const EntryIssueCallout: React.FC<{
	entryId: string;
	issue: (typeof SECURITY_ISSUES)[number];
}> = ({ entryId, issue }) => {
	const severity = readIssueSeverity(issue);
	const Icon = severity === "suggestion" ? Info : ShieldAlert;

	return (
		<div
			className={cn(
				"mb-4 flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13.5px]",
				SEVERITY_STYLES[severity],
			)}
		>
			<Icon className="size-4.5 shrink-0" />
			<p className="min-w-0 flex-1">
				<span className="font-semibold">
					{ISSUE_MESSAGES[issue].title}
				</span>{" "}
				{ISSUE_MESSAGES[issue].detail}
			</p>
			<Link
				to="/vault/$id/edit"
				params={{ id: entryId }}
				className="shrink-0 rounded-lg px-2.5 py-1 text-[13px] font-medium ring-1 ring-current transition-colors hover:bg-current/10"
			>
				{severity === "suggestion" ? "Edit" : "Change"}
			</Link>
		</div>
	);
};

export { EntryIssueCallout };
