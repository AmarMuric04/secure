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
	const details = [
		session.ipAddress,
		session.isCurrent
			? "Active now"
			: `Active ${formatRelativeTime(session.lastActiveAt)}`,
		`signed in ${formatRelativeTime(session.createdAt)}`,
	].filter(Boolean);

	return (
		<div className="flex items-center gap-3.5 py-3.5">
			<span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border ring-inset">
				<Icon className="size-4" />
			</span>

			<div className="min-w-0 flex-1">
				<p className="flex items-center gap-2 text-sm font-medium">
					<span className="truncate">
						{readDeviceLabel(session.userAgent)}
					</span>
					{session.isCurrent && (
						<span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
							This device
						</span>
					)}
				</p>
				<p className="truncate text-[13px] text-subtle">
					{details.join(" · ")}
				</p>
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
