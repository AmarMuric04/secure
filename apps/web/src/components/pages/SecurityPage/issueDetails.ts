import {
	Hourglass,
	Repeat2,
	ShieldAlert,
	Sparkles,
	TriangleAlert,
} from "lucide-react";

const URGENT_PILL = "bg-destructive/10 text-destructive";
const WARNING_PILL = "bg-warning-soft text-warning";
const QUIET_PILL = "bg-accent text-muted-foreground";

const FILTER_DETAILS = {
	compromised: {
		label: "Breached",
		title: "Exposed in a breach",
		hint: "Change these first. Use Check for breaches to refresh this list.",
		icon: ShieldAlert,
		tone: "text-destructive",
	},
	weak: {
		label: "Weak",
		title: "Easy to guess",
		hint: "Short, predictable or built from your name. Generate a random one instead.",
		icon: TriangleAlert,
		tone: "text-warning",
	},
	reused: {
		label: "Reused",
		title: "Reused or nearly the same",
		hint: "One leak unlocks every site that shares it. Give each its own.",
		icon: Repeat2,
		tone: "text-warning",
	},
	stale: {
		label: "Due for a change",
		title: "Not changed in a while",
		hint: "Old passwords have had more time to leak. Rotate these when you can.",
		icon: Hourglass,
		tone: "text-muted-foreground",
	},
	tidy: {
		label: "Tidy up",
		title: "Suggestions",
		hint: "Not urgent. Insecure addresses, duplicates and accounts you no longer use.",
		icon: Sparkles,
		tone: "text-muted-foreground",
	},
};

const ISSUE_LABELS = {
	compromised: { label: "Breached", pill: URGENT_PILL },
	siteBreached: { label: "Site breached", pill: URGENT_PILL },
	weak: { label: "Weak", pill: WARNING_PILL },
	personal: { label: "Contains a name", pill: WARNING_PILL },
	reused: { label: "Reused", pill: WARNING_PILL },
	similar: { label: "Similar", pill: WARNING_PILL },
	stale: { label: "Due for a change", pill: QUIET_PILL },
	insecure: { label: "Insecure address", pill: QUIET_PILL },
	duplicate: { label: "Duplicate", pill: QUIET_PILL },
	unused: { label: "Unused", pill: QUIET_PILL },
};

export { FILTER_DETAILS, ISSUE_LABELS };
