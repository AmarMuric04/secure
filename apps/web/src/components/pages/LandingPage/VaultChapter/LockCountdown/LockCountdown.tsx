import { formatCountdown } from "formatting-service";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

const START_SECONDS = 15 * 60;

const LockCountdown: React.FC = () => {
	const [seconds, setSeconds] = useState(START_SECONDS);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setSeconds((current) =>
				current > 1 ? current - 1 : START_SECONDS,
			);
		}, 1_000);

		return () => window.clearInterval(interval);
	}, []);

	return (
		<span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
			<Lock className="size-3.5" />
			Locks in
			<span className="font-mono text-foreground tabular-nums">
				{formatCountdown(seconds)}
			</span>
		</span>
	);
};

export { LockCountdown };
