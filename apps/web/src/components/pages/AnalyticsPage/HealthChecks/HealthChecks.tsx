import type { buildVaultAnalytics } from "business-logic-secure";

import { AnalyticsSection } from "../AnalyticsSection";
import { HealthMeter } from "../HealthMeter";

const HealthChecks: React.FC<{
	checks: NonNullable<ReturnType<typeof buildVaultAnalytics>>["healthChecks"];
	total: number;
}> = ({ checks, total }) => {
	return (
		<AnalyticsSection
			title="Vault health"
			description="Share of your passwords that pass each check"
		>
			<ul className="space-y-4">
				{checks.map((check) => (
					<li key={check.key}>
						<div className="mb-1.5 flex items-baseline gap-2 text-sm">
							<span className="min-w-0 flex-1 truncate">
								{check.label}
							</span>
							<span className="text-xs text-subtle tabular-nums">
								{check.count} of {total}
							</span>
							<span className="w-10 text-right font-medium tabular-nums">
								{check.percentage}%
							</span>
						</div>
						<HealthMeter
							label={check.label}
							percentage={check.percentage}
						/>
					</li>
				))}
			</ul>
		</AnalyticsSection>
	);
};

export { HealthChecks };
