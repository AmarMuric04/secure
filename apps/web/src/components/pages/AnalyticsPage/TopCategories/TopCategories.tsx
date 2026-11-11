import type { buildVaultAnalytics } from "business-logic-secure";
import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

import { AnalyticsSection } from "../AnalyticsSection";
import { MarkTooltip } from "../MarkTooltip";

const TopCategories: React.FC<{
	categories: NonNullable<
		ReturnType<typeof buildVaultAnalytics>
	>["topCategories"];
}> = ({ categories }) => {
	return (
		<AnalyticsSection
			title="Top categories"
			description="Where your passwords live"
		>
			<ul className="space-y-3">
				{categories.map((category, index) => (
					<li
						key={category.key}
						className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-3 text-sm sm:grid-cols-[minmax(0,10rem)_1fr]"
					>
						<span className="truncate text-muted-foreground">
							{category.category}
						</span>
						<span className="flex items-center gap-2">
							<MarkTooltip
								label={`${category.category}: ${category.count} (${category.percentage}% of vault)`}
								style={{ width: `${category.ratio * 85}%` }}
								className="block h-5 min-w-1"
							>
								<motion.span
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{
										duration: 0.7,
										delay: 0.1 + index * 0.06,
										ease: EASE_OUT,
									}}
									className="block size-full origin-left rounded-r-[4px] bg-chart-4"
								/>
							</MarkTooltip>
							<span className="text-xs font-medium tabular-nums">
								{category.count}
							</span>
						</span>
					</li>
				))}
			</ul>
		</AnalyticsSection>
	);
};

export { TopCategories };
