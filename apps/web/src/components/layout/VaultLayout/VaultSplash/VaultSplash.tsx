import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { CombinationDial } from "@/components/shared/CombinationDial";
import { VaultMark } from "@/components/shared/VaultMark";

const TURN_MILLISECONDS = 260;
const TURNS_PER_SWEEP = 9;

const VaultSplash: React.FC<{ message: string }> = ({ message }) => {
	const isReducedMotion = useReducedMotion();

	const [turn, setTurn] = useState(0);

	useEffect(() => {
		if (isReducedMotion) {
			return;
		}

		const interval = window.setInterval(
			() => setTurn((current) => (current + 1) % (TURNS_PER_SWEEP * 2)),
			TURN_MILLISECONDS,
		);

		return () => window.clearInterval(interval);
	}, [isReducedMotion]);

	const length = turn < TURNS_PER_SWEEP ? turn : TURNS_PER_SWEEP * 2 - turn;

	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed inset-0 z-50 grid place-items-center bg-background px-5 py-24"
		>
			<div className="absolute top-5 left-5 flex items-center gap-2.5 text-[15px] font-semibold tracking-tight sm:left-8">
				<VaultMark size="sm" />
				Sealed
			</div>

			<div className="flex w-full max-w-100 flex-col items-center text-center motion-safe:animate-[rise-in_0.45s_var(--ease-out-quint)]">
				<div className="mb-9">
					<CombinationDial length={length} status="idle" />
				</div>

				<h1 className="text-[2.5rem] leading-[1.05] font-medium tracking-[-0.045em] text-balance sm:text-5xl">
					Opening your vault
				</h1>
				<p className="mt-4 text-pretty text-muted-foreground">
					{message}
				</p>

				<span className="mt-6 h-11.5 w-full border-y border-foreground/15" />
				<span className="mt-7 h-14.5 w-full animate-pulse rounded-[18px] bg-card ring-1 ring-input" />
				<span className="mt-3 h-5 min-h-5" />
				<span className="mt-3 h-5" />
			</div>

			<p className="pointer-events-none absolute inset-x-0 bottom-6 px-5 text-center text-sm text-subtle">
				Your master password never leaves this device.
			</p>
		</div>
	);
};

export { VaultSplash };
