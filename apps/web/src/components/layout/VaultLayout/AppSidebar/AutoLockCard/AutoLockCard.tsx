import { secure } from "business-logic-secure";
import { formatCountdown } from "formatting-service";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

import {
	Button,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui";

const AutoLockCard: React.FC<{ lockAtRef: React.RefObject<number> }> = ({
	lockAtRef,
}) => {
	const { lock } = secure.vault.useVaultLock();

	const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

	const countdown = secondsLeft === null ? "—" : formatCountdown(secondsLeft);

	useEffect(() => {
		const intervalId = window.setInterval(
			() => setSecondsLeft((lockAtRef.current - Date.now()) / 1_000),
			1_000,
		);

		return () => window.clearInterval(intervalId);
	}, [lockAtRef]);

	return (
		<>
			<div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 ring-1 ring-sidebar-border group-data-[collapsible=icon]:hidden">
				<Lock className="size-4 shrink-0 text-subtle" />
				<div className="min-w-0 leading-tight">
					<p className="text-xs text-subtle">Auto-lock in</p>
					<p className="text-sm font-medium tabular-nums">
						{countdown}
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="ml-auto h-7 rounded-md px-2.5 text-foreground hover:bg-sidebar-accent"
					onClick={lock}
				>
					Lock
				</Button>
			</div>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Lock vault, auto-locks in ${countdown}`}
						className="hidden rounded-lg text-muted-foreground group-data-[collapsible=icon]:inline-flex hover:bg-sidebar-accent"
						onClick={lock}
					>
						<Lock />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="right">
					Lock vault · {countdown}
				</TooltipContent>
			</Tooltip>
		</>
	);
};

export { AutoLockCard };
