import { Link } from "@tanstack/react-router";
import { buildSecurityInbox, secure } from "business-logic-secure";
import { Plus, ShieldCheck } from "lucide-react";

import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Button, EmptyState } from "@/components/ui";
import { Route } from "@/routes/vault/security";

import { BreachCheckButton } from "./BreachCheckButton";
import { SecurityFilters } from "./SecurityFilters";
import { SecurityInboxList } from "./SecurityInboxList";
import { SecurityProgress } from "./SecurityProgress";
import { SecuritySkeleton } from "./SecuritySkeleton";

const SecurityPage: React.FC = () => {
	const { issue } = Route.useSearch();
	const vault = secure.vault.useVault({ includeDeleted: false });
	const audit = secure.vault.useVaultAudit();

	if (vault.isPending) {
		return <SecuritySkeleton />;
	}

	if (vault.isError) {
		return (
			<QueryErrorState
				title="Failed to load security data"
				message={vault.error.message}
				onRetry={() => void vault.refetch()}
			/>
		);
	}

	if (vault.data.passwords.length === 0) {
		return (
			<EmptyState
				icon={<ShieldCheck />}
				title="Nothing to check yet"
				description="Add passwords and we will watch them for weak, reused and breached logins."
				action={
					<Button asChild>
						<Link to="/vault/new">
							<Plus />
							Add password
						</Link>
					</Button>
				}
			/>
		);
	}

	if (!audit.data) {
		return <SecuritySkeleton />;
	}

	const inbox = buildSecurityInbox({
		passwords: vault.data.passwords,
		filter: issue,
		audit: audit.data,
	});

	return (
		<div>
			<SecurityProgress
				healthyCount={inbox.healthyCount}
				total={inbox.total}
				healthyPercentage={inbox.healthyPercentage}
				actions={<BreachCheckButton passwords={vault.data.passwords} />}
			/>

			<div className="mt-10 grid gap-6 md:grid-cols-[12.5rem_minmax(0,1fr)] md:gap-10">
				<SecurityFilters
					selected={issue}
					issueCount={inbox.issueCount}
					counts={inbox.counts}
				/>

				<SecurityInboxList issue={issue} entries={inbox.entries} />
			</div>
		</div>
	);
};

export { SecurityPage };
