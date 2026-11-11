import { Copy, Eye, EyeOff, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { useCopySecret } from "@/lib/useCopySecret";
import { cn } from "@/lib/utils";

const PasswordField: React.FC<{
	value: string;
	isVisible: boolean;
	isGeneratorOpen: boolean;
	inlineGenerator: React.ReactNode;
	onChange: (value: string) => void;
	onVisibleChange: (isVisible: boolean) => void;
	onGeneratorToggle: () => void;
}> = ({
	value,
	isVisible,
	isGeneratorOpen,
	inlineGenerator,
	onChange,
	onVisibleChange,
	onGeneratorToggle,
}) => {
	const copySecret = useCopySecret();

	const [isFocused, setIsFocused] = useState(false);

	const handleCopy = () => {
		void copySecret({ value, label: "Password" });
	};

	return (
		<div className="pb-2">
			<div className="flex items-center gap-0.5">
				<input
					id="entry-password"
					type={isVisible ? "text" : "password"}
					autoComplete="new-password"
					spellCheck={false}
					placeholder="Type or generate one"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					className="h-10 min-w-0 flex-1 bg-transparent font-mono text-[15px] tracking-wide outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-subtle"
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={isVisible ? "Hide password" : "Show password"}
					onClick={() => onVisibleChange(!isVisible)}
				>
					{isVisible ? <EyeOff /> : <Eye />}
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Copy password"
					disabled={!value}
					onClick={handleCopy}
				>
					<Copy />
				</Button>
				<button
					type="button"
					aria-expanded={isGeneratorOpen}
					onClick={onGeneratorToggle}
					className={cn(
						"ml-1 inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors duration-200",
						isGeneratorOpen
							? "bg-primary-soft text-primary"
							: "text-muted-foreground hover:bg-accent hover:text-foreground",
					)}
				>
					<Sparkles className="size-3.5" />
					Generate
				</button>
			</div>

			<AnimatePresence initial={false}>
				{(value || isFocused) && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: EASE_OUT }}
						className="overflow-hidden"
					>
						<div className="pt-1 pb-1">
							<PasswordStrengthMeter password={value} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{inlineGenerator}
		</div>
	);
};

export { PasswordField };
