import { calculatePasswordStrength, secure } from "business-logic-secure";
import { AnimatePresence, motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STRENGTH_FILL_COLORS = [
	"bg-destructive",
	"bg-destructive",
	"bg-warning",
	"bg-primary",
	"bg-primary",
];
const STRENGTH_TEXT_COLORS = [
	"text-destructive",
	"text-destructive",
	"text-warning",
	"text-foreground",
	"text-foreground",
];
const PasswordStrengthMeter: React.FC<{ password: string }> = ({
	password,
}) => {
	const { data: user } = secure.auth.useSession();

	const strength = calculatePasswordStrength(password);

	if (!password || !user?.settings.showPasswordStrength) {
		return null;
	}

	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-3">
				<div className="relative h-1 flex-1 overflow-hidden rounded-full bg-input">
					<motion.div
						initial={{ width: 0 }}
						animate={{
							width: `${((strength.score + 1) / 5) * 100}%`,
						}}
						transition={{ duration: 0.45, ease: EASE_OUT }}
						className={cn(
							"absolute inset-y-0 left-0 rounded-full transition-colors duration-300",
							STRENGTH_FILL_COLORS[strength.score],
						)}
					/>
				</div>
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={strength.label}
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.18, ease: EASE_OUT }}
						className={cn(
							"w-20 text-right text-xs font-medium",
							STRENGTH_TEXT_COLORS[strength.score],
						)}
					>
						{strength.label}
					</motion.span>
				</AnimatePresence>
			</div>

			<p className="text-xs text-subtle">
				<span className="font-mono tabular-nums">
					{strength.entropy}
				</span>{" "}
				bits · cracked in {strength.crackTime}
				{strength.feedback.length > 0 && <> · {strength.feedback[0]}</>}
			</p>
		</div>
	);
};

export { PasswordStrengthMeter };
