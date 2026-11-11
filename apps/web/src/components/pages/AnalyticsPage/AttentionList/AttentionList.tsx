import { Link } from "@tanstack/react-router";
import type { buildVaultAnalytics } from "business-logic-secure";
import {
	AlertTriangle,
	CheckCircle2,
	ChevronRight,
	Copy,
	Hourglass,
	ShieldX,
	Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { AnalyticsSection } from "../AnalyticsSection";

const ISSUES = [
	{
		key: "compromised",
		label: "Breached",
		action: "Change these first",
		icon: ShieldX,
		tone: "text-destructive",
	},
	{
		key: "weak",
		label: "Weak",
		action: "Easy to guess or built from a name",
		icon: AlertTriangle,
		tone: "text-warning",
	},
	{
		key: "reused",
		label: "Reused",
		action: "Same or nearly the same as another",
		icon: Copy,
		tone: "text-warning",
	},
	{
		key: "stale",
		label: "Due for a change",
		action: "Not changed in a while",
		icon: Hourglass,
		tone: "text-muted-foreground",
	},
	{
		key: "tidy",
		label: "Tidy up",
		action: "Insecure addresses, duplicates, unused",
		icon: Sparkles,
		tone: "text-muted-foreground",
	},
] as const;

const AttentionList: React.FC<{
	stats: NonNullable<ReturnType<typeof buildVaultAnalytics>>["stats"];
}> = ({ stats }) => {
	if (stats.issueCount === 0) {
		return (
			<AnalyticsSection title="Needs attention">
				<p className="flex items-center gap-2.5 text-sm text-muted-foreground">
					<CheckCircle2 className="size-4.5 text-primary" />
					Nothing to fix. Every password is strong, unique and recent.
				</p>
			</AnalyticsSection>
		);
	}

	return (
		<AnalyticsSection
			title="Needs attention"
			description="Passwords to fix, most urgent first"
		>
			<ul className="-mx-2">
				{ISSUES.map((issue) => (
					<li key={issue.key}>
						<Link
							to="/vault/security"
							search={{ issue: issue.key }}
							className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-secondary"
						>
							<issue.icon
								className={cn(
									"size-4.5 shrink-0",
									stats[issue.key] > 0
										? issue.tone
										: "text-subtle",
								)}
							/>
							<span className="min-w-0 flex-1">
								<span className="block text-sm font-medium">
									{issue.label}
								</span>
								<span className="block truncate text-xs text-subtle">
									{issue.action}
								</span>
							</span>
							<span className="text-lg font-semibold tabular-nums">
								{stats[issue.key]}
							</span>
							<ChevronRight className="size-4 text-subtle" />
						</Link>
					</li>
				))}
			</ul>
		</AnalyticsSection>
	);
};

export { AttentionList };
