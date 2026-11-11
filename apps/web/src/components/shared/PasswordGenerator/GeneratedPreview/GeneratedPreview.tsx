import { ArrowDownToLine, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { ScrambleText } from "@/components/shared/ScrambleText";
import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

const GeneratedPreview: React.FC<{
	value: string | null;
	onRegenerate: () => void;
	onUse: () => void;
}> = ({ value, onRegenerate, onUse }) => {
	const [spinCount, setSpinCount] = useState(0);

	const handleRegenerate = () => {
		setSpinCount(spinCount + 1);
		onRegenerate();
	};

	return (
		<div className="rounded-xl bg-card ring-1 ring-border">
			<p
				aria-live="polite"
				className="min-h-17 px-4 pt-3.5 pb-2 font-mono text-[15px] leading-6 break-all"
			>
				{value ? (
					<ScrambleText text={value} />
				) : (
					<span className="font-sans text-sm text-destructive">
						Your options leave no characters to choose from
					</span>
				)}
			</p>

			<div className="flex items-center justify-between gap-2 border-t border-border p-1.5">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleRegenerate}
				>
					<motion.span
						animate={{ rotate: spinCount * 180 }}
						transition={{ duration: 0.5, ease: EASE_OUT }}
						className="inline-flex"
					>
						<RefreshCw />
					</motion.span>
					Regenerate
				</Button>

				<Button
					type="button"
					size="sm"
					disabled={!value}
					onClick={onUse}
				>
					<ArrowDownToLine />
					Use password
				</Button>
			</div>
		</div>
	);
};

export { GeneratedPreview };
