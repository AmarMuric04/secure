import { Link } from "@tanstack/react-router";
import { SECURITY_FILTER_KEYS } from "business-logic-secure";
import { Inbox } from "lucide-react";
import { motion } from "motion/react";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

import { FILTER_DETAILS } from "../issueDetails";

const FilterLink: React.FC<{
	issue: (typeof SECURITY_FILTER_KEYS)[number] | undefined;
	label: string;
	count: number;
	icon: React.ComponentType<{ className?: string }>;
	tone: string;
	isActive: boolean;
}> = ({ issue, label, count, icon: Icon, tone, isActive }) => {
	return (
		<Link
			to="/vault/security"
			search={{ issue }}
			replace
			aria-current={isActive ? "page" : undefined}
			className={cn(
				"relative flex h-9 shrink-0 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-200",
				isActive
					? "text-foreground"
					: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
			)}
		>
			{isActive && (
				<motion.span
					layoutId="security-filter"
					transition={{ type: "spring", stiffness: 500, damping: 40 }}
					className="absolute inset-0 rounded-lg bg-accent"
				/>
			)}
			<Icon
				className={cn(
					"relative size-4",
					count > 0 ? tone : "text-subtle",
				)}
			/>
			<span className="relative flex-1 font-medium">{label}</span>
			<span className="relative font-mono text-xs text-subtle tabular-nums">
				{count}
			</span>
		</Link>
	);
};

const SecurityFilters: React.FC<{
	selected: (typeof SECURITY_FILTER_KEYS)[number] | undefined;
	issueCount: number;
	counts: Record<(typeof SECURITY_FILTER_KEYS)[number], number>;
}> = ({ selected, issueCount, counts }) => {
	return (
		<nav
			aria-label="Issue types"
			className="-mx-1 flex gap-1 overflow-x-auto px-1 md:sticky md:top-0 md:mx-0 md:flex-col md:self-start md:overflow-visible md:px-0"
		>
			<FilterLink
				issue={undefined}
				label="All issues"
				count={issueCount}
				icon={Inbox}
				tone="text-foreground"
				isActive={!selected}
			/>
			<span className="mx-2 my-1.5 hidden h-px bg-border md:block" />
			{SECURITY_FILTER_KEYS.map((filter) => (
				<Fragment key={filter}>
					{filter === "tidy" && (
						<span className="mx-2 my-1.5 hidden h-px bg-border md:block" />
					)}
					<FilterLink
						issue={filter}
						label={FILTER_DETAILS[filter].label}
						count={counts[filter]}
						icon={FILTER_DETAILS[filter].icon}
						tone={FILTER_DETAILS[filter].tone}
						isActive={selected === filter}
					/>
				</Fragment>
			))}
		</nav>
	);
};

export { SecurityFilters };
