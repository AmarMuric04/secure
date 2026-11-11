import type { buildVaultAnalytics } from "business-logic-secure";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { AnalyticsSection } from "../AnalyticsSection";
import { MarkTooltip } from "../MarkTooltip";

const MIN_LABELLED_PERCENTAGE = 9;
const STEP_STYLES = [
	"bg-chart-1 text-chart-1-ink",
	"bg-chart-2 text-chart-2-ink",
	"bg-chart-3 text-chart-3-ink",
	"bg-chart-4 text-chart-4-ink",
	"bg-chart-5 text-chart-5-ink",
];

const StrengthBreakdown: React.FC<{
	buckets: NonNullable<
		ReturnType<typeof buildVaultAnalytics>
	>["strengthBreakdown"];
}> = ({ buckets }) => {
	return (
		<AnalyticsSection
			title="Password strength"
			description="How hard each password is to guess"
		>
			<motion.div
				initial={{ clipPath: "inset(0 100% 0 0 round 4px)" }}
				animate={{ clipPath: "inset(0 0% 0 0 round 4px)" }}
				transition={{
					duration: 0.9,
					delay: 0.1,
					ease: EASE_OUT,
				}}
				className="flex h-7 gap-0.5"
			>
				{buckets
					.filter((bucket) => bucket.count > 0)
					.map((bucket) => (
						<MarkTooltip
							key={bucket.strength}
							label={`${bucket.label}: ${bucket.count} (${bucket.percentage}%)`}
							style={{ flexGrow: bucket.count }}
							className={cn(
								"flex min-w-1 basis-0 items-center rounded-[4px] px-2 text-xs font-medium tabular-nums",
								STEP_STYLES[bucket.strength],
							)}
						>
							{bucket.percentage >= MIN_LABELLED_PERCENTAGE &&
								`${bucket.percentage}%`}
						</MarkTooltip>
					))}
			</motion.div>

			<ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3">
				{buckets.map((bucket) => (
					<li
						key={bucket.strength}
						className="flex items-center gap-2"
					>
						<span
							className={cn(
								"size-2.5 shrink-0 rounded-[3px]",
								STEP_STYLES[bucket.strength],
							)}
						/>
						<span className="text-muted-foreground">
							{bucket.label}
						</span>
						<span className="ml-auto text-subtle tabular-nums">
							{bucket.count}
						</span>
					</li>
				))}
			</ul>
		</AnalyticsSection>
	);
};

export { StrengthBreakdown };
