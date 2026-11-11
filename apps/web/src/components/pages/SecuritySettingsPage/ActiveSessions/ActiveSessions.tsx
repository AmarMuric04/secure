import { secure } from "business-logic-secure";

import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { SettingsSection } from "@/components/shared/SettingsSection";
import { Button, Skeleton, useToast } from "@/components/ui";

import { SessionRow } from "./SessionRow";

const ActiveSessions: React.FC = () => {
	const sessions = secure.auth.useActiveSessions();
	const revokeSession = secure.auth.useRevokeSession();
	const revokeOtherSessions = secure.auth.useRevokeOtherSessions();
	const { addToast } = useToast();

	const otherCount =
		sessions.data?.filter((session) => !session.isCurrent).length ?? 0;
	const isRevoking = revokeSession.isPending || revokeOtherSessions.isPending;

	const handleError = (error: Error) => {
		addToast({
			type: "error",
			title: "Could not sign out",
			message: error.message,
		});
	};

	const handleRevoke = (id: string) => {
		revokeSession.mutate(id, { onError: handleError });
	};

	const handleRevokeOthers = () => {
		revokeOtherSessions.mutate(undefined, {
			onError: handleError,
			onSuccess: ({ revokedSessions }) =>
				addToast({
					type: "success",
					title: `Signed out ${revokedSessions} other ${revokedSessions === 1 ? "device" : "devices"}`,
				}),
		});
	};

	if (sessions.isPending) {
		return (
			<SettingsSection title="Signed-in devices">
				<div className="space-y-3 py-4">
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
				</div>
			</SettingsSection>
		);
	}

	if (sessions.isError) {
		return (
			<QueryErrorState
				title="Failed to load devices"
				message={sessions.error.message}
				onRetry={() => void sessions.refetch()}
			/>
		);
	}

	return (
		<SettingsSection
			title="Signed-in devices"
			description="Where your account is signed in. Signing a device out ends its session right away."
			footer={
				otherCount > 0 && (
					<Button
						variant="outline"
						size="sm"
						isLoading={revokeOtherSessions.isPending}
						disabled={isRevoking}
						onClick={handleRevokeOthers}
					>
						Sign out all other devices
					</Button>
				)
			}
		>
			{sessions.data.map((session) => (
				<SessionRow
					key={session.id}
					session={session}
					isRevoking={isRevoking}
					onRevoke={handleRevoke}
				/>
			))}
		</SettingsSection>
	);
};

export { ActiveSessions };
