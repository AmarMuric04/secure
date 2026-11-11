import { generateTotpCode, parseTotpSecret } from "business-logic-secure";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { useCopySecret } from "@/lib/useCopySecret";
import { cn } from "@/lib/utils";

const RING_RADIUS = 9;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const URGENT_SECONDS = 5;

const formatCode = (code: string) =>
	code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

const TotpCodeRow: React.FC<{ secret: string }> = ({ secret }) => {
	const copySecret = useCopySecret();

	const [current, setCurrent] = useState<{
		code: string;
		secondsRemaining: number;
	} | null>(null);

	const parsed = parseTotpSecret(secret);
	const period = parsed?.period ?? 30;
	const isUrgent = !!current && current.secondsRemaining <= URGENT_SECONDS;

	useEffect(() => {
		const config = parseTotpSecret(secret);

		if (!config) {
			return;
		}

		let isActive = true;

		const refresh = () => {
			void generateTotpCode({ ...config, timestamp: Date.now() }).then(
				(next) => {
					if (isActive) {
						setCurrent(next);
					}
				},
			);
		};

		refresh();

		const interval = window.setInterval(refresh, 1_000);

		return () => {
			isActive = false;
			window.clearInterval(interval);
		};
	}, [secret]);

	if (!parsed) {
		return (
			<div className="flex min-h-15.5 items-center px-4 py-3 not-first:border-t">
				<p className="text-sm text-destructive">
					The saved 2FA secret is not valid. Edit the entry to fix it.
				</p>
			</div>
		);
	}

	return (
		<div className="group/field flex min-h-15.5 items-center gap-3 py-3 pr-2.5 pl-4 not-first:border-t">
			<div className="min-w-0 flex-1">
				<p className="mb-0.5 text-xs text-subtle">
					2FA code{parsed.issuer ? ` · ${parsed.issuer}` : ""}
				</p>
				<p
					className={cn(
						"font-mono text-[19px] tracking-[0.12em] tabular-nums transition-colors",
						isUrgent && "text-warning",
					)}
				>
					{current ? formatCode(current.code) : "••• •••"}
				</p>
			</div>

			<svg
				viewBox="0 0 24 24"
				aria-label={`${current?.secondsRemaining ?? period} seconds left`}
				className="size-6 shrink-0 -rotate-90"
			>
				<circle
					cx="12"
					cy="12"
					r={RING_RADIUS}
					fill="none"
					strokeWidth="2.5"
					className="stroke-accent"
				/>
				<circle
					cx="12"
					cy="12"
					r={RING_RADIUS}
					fill="none"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeDasharray={RING_LENGTH}
					strokeDashoffset={
						RING_LENGTH *
						(1 - (current?.secondsRemaining ?? period) / period)
					}
					className={cn(
						"transition-[stroke-dashoffset] duration-1000 ease-linear",
						isUrgent ? "stroke-warning" : "stroke-primary",
					)}
				/>
			</svg>

			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="Copy 2FA code"
				disabled={!current}
				className="rounded-lg text-muted-foreground"
				onClick={() =>
					current &&
					void copySecret({ value: current.code, label: "2FA code" })
				}
			>
				<Copy />
			</Button>
		</div>
	);
};

export { TotpCodeRow };
