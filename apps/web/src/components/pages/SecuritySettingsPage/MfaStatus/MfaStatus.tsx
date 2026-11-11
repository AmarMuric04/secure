import { Smartphone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const MfaStatus: React.FC<{
	isEnabled: boolean;
	onEnable: () => void;
	onDisable: () => void;
}> = ({ isEnabled, onEnable, onDisable }) => {
	return (
		<div className="grid gap-x-8 gap-y-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
			<div className="flex min-w-0 items-start gap-3.5">
				<span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-muted ring-1 ring-border">
					<Smartphone className="size-4 text-muted-foreground" />
				</span>
				<div className="min-w-0">
					<p className="flex items-center gap-2 text-sm font-medium text-foreground">
						Authenticator app
						<span
							className={cn(
								"inline-flex h-5 items-center gap-1.5 overflow-hidden rounded-full px-2 text-xs font-medium transition-colors duration-300",
								isEnabled
									? "bg-primary-soft text-primary"
									: "bg-accent text-muted-foreground",
							)}
						>
							<span
								className={cn(
									"size-1.5 rounded-full transition-colors duration-300",
									isEnabled ? "bg-primary" : "bg-subtle",
								)}
							/>
							<AnimatePresence mode="popLayout" initial={false}>
								<motion.span
									key={isEnabled ? "on" : "off"}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.2 }}
								>
									{isEnabled ? "On" : "Off"}
								</motion.span>
							</AnimatePresence>
						</span>
					</p>
					<p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
						{isEnabled
							? "A 6-digit code is required every time you sign in"
							: "Ask for a code from your phone when you sign in"}
					</p>
				</div>
			</div>

			{isEnabled ? (
				<Button variant="outline" size="sm" onClick={onDisable}>
					Turn off
				</Button>
			) : (
				<Button size="sm" onClick={onEnable}>
					Set up
				</Button>
			)}
		</div>
	);
};

export { MfaStatus };
