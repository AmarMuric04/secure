import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { useCopySecret } from "@/lib/useCopySecret";
import { cn } from "@/lib/utils";

const COPIED_MILLISECONDS = 1_600;

const CopyButton: React.FC<{
	value: string;
	label: string;
	variant?: React.ComponentProps<typeof Button>["variant"];
	size?: React.ComponentProps<typeof Button>["size"];
	text?: string;
	disabled?: boolean;
	className?: string;
	onCopied?: () => void;
}> = ({
	value,
	label,
	variant = "ghost",
	size = "icon-sm",
	text,
	disabled,
	className,
	onCopied,
}) => {
	const copySecret = useCopySecret();
	const isReducedMotion = useReducedMotion();

	const [isCopied, setIsCopied] = useState(false);

	useEffect(() => {
		if (!isCopied) {
			return;
		}

		const timeout = window.setTimeout(
			() => setIsCopied(false),
			COPIED_MILLISECONDS,
		);

		return () => window.clearTimeout(timeout);
	}, [isCopied]);

	const handleClick = async () => {
		const isSuccess = await copySecret({ value, label });

		if (!isSuccess) {
			return;
		}

		setIsCopied(true);

		if (onCopied) {
			onCopied();
		}
	};

	return (
		<Button
			type="button"
			variant={variant}
			size={size}
			aria-label={text ? undefined : `Copy ${label}`}
			disabled={disabled || !value}
			className={cn(isCopied && "text-primary hover:text-primary", className)}
			onClick={() => void handleClick()}
		>
			<span className="relative grid size-4 place-items-center">
				<AnimatePresence initial={false} mode="popLayout">
					<motion.span
						key={isCopied ? "copied" : "copy"}
						initial={
							isReducedMotion
								? { opacity: 0 }
								: { opacity: 0, scale: 0.4, rotate: isCopied ? -45 : 45 }
						}
						animate={{ opacity: 1, scale: 1, rotate: 0 }}
						exit={
							isReducedMotion
								? { opacity: 0 }
								: { opacity: 0, scale: 0.4 }
						}
						transition={{ duration: 0.22, ease: EASE_OUT }}
						className="grid place-items-center"
					>
						{isCopied ? (
							<Check className="size-4" strokeWidth={2.5} />
						) : (
							<Copy className="size-4" />
						)}
					</motion.span>
				</AnimatePresence>
			</span>
			{text && (isCopied ? "Copied" : text)}
			<span className="sr-only" aria-live="polite">
				{isCopied ? `${label} copied` : ""}
			</span>
		</Button>
	);
};

export { CopyButton };
