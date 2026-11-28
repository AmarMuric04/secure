import { readDeviceLabel } from "business-logic-secure";
import { formatRelativeTime } from "formatting-service";
import { Monitor, Smartphone } from "lucide-react";

import { Button } from "@/components/ui";

const MOBILE_PATTERN = /iPhone|iPad|Android|Mobile/;

const SessionRow: React.FC<{
	session: {
		id: string;
		userAgent: string | null;
		ipAddress: string | null;
		createdAt: string;
		lastActiveAt: string;
		isCurrent: boolean;
	};
	isRevoking: boolean;
	onRevoke: (id: string) => void;
}> = ({ session, isRevoking, onRevoke }) => {
	const Icon = MOBILE_PATTERN.test(session.userAgent ?? "")
		? Smartphone
		: Monitor;
	const activity = session.isCurrent
		? "active now"
		: `last active ${formatRelativeTime(session.lastActiveAt)}`;
	const location = session.ipAddress ? ` from ${session.ipAddress}` : "";
	const details = `Signed in ${formatRelativeTime(session.createdAt)}${location}, ${activity}`;

	return (
		<div className="flex items-center gap-3.5 py-3.5">
			<Icon className="size-4 shrink-0 text-subtle" />

			<div className="min-w-0 flex-1">
				<p className="flex items-center gap-2 text-sm font-medium">
					<span className="truncate">
						{readDeviceLabel(session.userAgent)}
					</span>
					{session.isCurrent && (
						<span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
							This device
						</span>
					)}
				</p>
				<p className="truncate text-[13px] text-subtle">{details}</p>
			</div>

			{!session.isCurrent && (
				<Button
					variant="ghost"
					size="sm"
					disabled={isRevoking}
					onClick={() => onRevoke(session.id)}
				>
					Sign out
				</Button>
			)}
		</div>
	);
};

export { SessionRow };
