import { Dices, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
import { Button, PasswordDots } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { useInputSelection } from "@/lib/useInputSelection";
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
	const [isFocused, setIsFocused] = useState(false);
	const { selection, handleSelect } = useInputSelection();

	return (
		<div className="pb-2">
			<div className="flex items-center gap-0.5">
				<div className="relative min-w-0 flex-1">
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
						onSelect={handleSelect}
						className={cn(
							"h-10 w-full bg-transparent font-mono text-[15px] tracking-wide outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-subtle",
							!isVisible &&
								"text-transparent caret-transparent selection:bg-transparent selection:text-transparent",
						)}
					/>
					{!isVisible && (
						<PasswordDots
							length={value.length}
							isFocused={isFocused}
							selection={selection}
							className="right-0 -left-[2.5px]"
						/>
					)}
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={isVisible ? "Hide password" : "Show password"}
					onClick={() => onVisibleChange(!isVisible)}
				>
					{isVisible ? <EyeOff /> : <Eye />}
				</Button>
				<CopyButton value={value} label="Password" />
				<button
					type="button"
					aria-expanded={isGeneratorOpen}
					onClick={onGeneratorToggle}
					className={cn(
						"ml-1 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-2.5 text-[13px] font-medium text-primary-foreground transition-[background-color,box-shadow,transform] duration-200 ease-out-quint hover:bg-primary/90 active:scale-[0.97]",
						isGeneratorOpen &&
							"ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
					)}
				>
					<Dices className="size-3.5" />
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
