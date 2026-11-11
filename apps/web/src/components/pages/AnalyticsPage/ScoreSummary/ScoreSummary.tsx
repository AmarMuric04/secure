import {
	type buildVaultAnalytics,
	readSecurityScoreLabel,
} from "business-logic-secure";

import { AnimatedNumber } from "@/components/shared/AnimatedNumber";

import { HealthMeter } from "../HealthMeter";

const StatTile: React.FC<{ label: string; value: number; note: string }> = ({
	label,
	value,
	note,
}) => {
	return (
		<div className="rounded-xl bg-muted p-4">
			<p className="text-[13px] text-muted-foreground">{label}</p>
			<AnimatedNumber
				value={value}
				className="mt-1 block text-2xl font-semibold tracking-tight tabular-nums"
			/>
			<p className="mt-0.5 text-xs text-subtle">{note}</p>
		</div>
	);
};

const ScoreSummary: React.FC<{
	securityScore: number;
	stats: NonNullable<ReturnType<typeof buildVaultAnalytics>>["stats"];
}> = ({ securityScore, stats }) => {
	return (
		<div className="grid gap-3 lg:grid-cols-[1.2fr_2fr]">
			<div className="rounded-xl p-5 ring-1 ring-border sm:p-6">
				<p className="text-[13px] text-muted-foreground">
					Security score
				</p>
				<p className="mt-1 flex items-baseline gap-2">
					<AnimatedNumber
						value={securityScore}
						duration={1.1}
						className="text-5xl font-semibold tracking-tight tabular-nums"
					/>
					<span className="text-subtle">/ 100</span>
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					{readSecurityScoreLabel(securityScore)}
				</p>
				<HealthMeter
					label="Security score"
					percentage={securityScore}
					className="mt-4"
				/>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<StatTile
					label="Passwords"
					value={stats.total}
					note="in your vault"
				/>
				<StatTile
					label="Strong"
					value={stats.strong}
					note="rated good or strong"
				/>
				<StatTile
					label="Need attention"
					value={stats.issueCount}
					note="weak, reused or breached"
				/>
			</div>
		</div>
	);
};

export { ScoreSummary };
