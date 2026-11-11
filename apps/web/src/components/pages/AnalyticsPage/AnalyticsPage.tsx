import { Link } from "@tanstack/react-router";
import {
	buildVaultAnalytics,
	DEFAULT_PASSWORD_MAX_AGE_DAYS,
	secure,
} from "business-logic-secure";
import { Plus, Shield } from "lucide-react";
import { motion } from "motion/react";

import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Button, EmptyState } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

import { AnalyticsSkeleton } from "./AnalyticsSkeleton";
import { AttentionList } from "./AttentionList";
import { HealthChecks } from "./HealthChecks";
import { ScoreSummary } from "./ScoreSummary";
import { StrengthBreakdown } from "./StrengthBreakdown";
import { TopCategories } from "./TopCategories";

const STAGGER = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.08 } },
};
const RISE = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.45, ease: EASE_OUT },
	},
};

const AnalyticsContent: React.FC = () => {
	const vault = secure.vault.useVault({ includeDeleted: false });
	const { data: user } = secure.auth.useSession();
	const audit = secure.vault.useVaultAudit();

	if (vault.isPending) {
		return <AnalyticsSkeleton />;
	}

	if (vault.isError) {
		return (
			<QueryErrorState
				title="Failed to load analytics"
				message={vault.error.message}
				onRetry={() => void vault.refetch()}
			/>
		);
	}

	if (!audit.data) {
		return <AnalyticsSkeleton />;
	}

	const analytics = buildVaultAnalytics({
		passwords: vault.data.passwords,
		categories: vault.data.categories,
		maxAgeDays:
			user?.settings.passwordMaxAgeDays ?? DEFAULT_PASSWORD_MAX_AGE_DAYS,
		audit: audit.data,
	});

	if (!analytics) {
		return (
			<EmptyState
				icon={<Shield className="h-8 w-8 text-muted-foreground" />}
				title="Nothing to analyze yet"
				description="Add some passwords to see your security analytics."
				action={
					<Button asChild className="rounded-lg">
						<Link to="/vault/new">
							<Plus />
							Add password
						</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<motion.div
			variants={STAGGER}
			initial="hidden"
			animate="visible"
			className="space-y-3"
		>
			<motion.div variants={RISE}>
				<ScoreSummary
					securityScore={analytics.securityScore}
					stats={analytics.stats}
				/>
			</motion.div>

			<motion.div variants={RISE} className="grid gap-3 lg:grid-cols-2">
				<StrengthBreakdown buckets={analytics.strengthBreakdown} />
				<HealthChecks
					checks={analytics.healthChecks}
					total={analytics.stats.total}
				/>
			</motion.div>

			<motion.div variants={RISE} className="grid gap-3 lg:grid-cols-2">
				<TopCategories categories={analytics.topCategories} />
				<AttentionList stats={analytics.stats} />
			</motion.div>
		</motion.div>
	);
};

const AnalyticsPage: React.FC = () => {
	return (
		<div className="space-y-3">
			<PageHeader
				title="Analytics"
				description="How healthy your vault is right now"
			/>

			<AnalyticsContent />
		</div>
	);
};

export { AnalyticsPage };
