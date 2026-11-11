import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const VISIBLE_DOT_COUNT = 16;

const MasterPasswordField: React.FC<{
	value: string;
	label: string;
	autoComplete: string;
	isInvalid: boolean;
	isDisabled: boolean;
	autoFocus?: boolean;
	submit?: { isBusy: boolean };
	onChange: (value: string) => void;
	onCapsLockChange: (isOn: boolean) => void;
}> = ({
	value,
	label,
	autoComplete,
	isInvalid,
	isDisabled,
	autoFocus = false,
	submit,
	onChange,
	onCapsLockChange,
}) => {
	const [isRevealed, setIsRevealed] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const isReady = value.length > 0;

	const handleKeyUp = (event: React.KeyboardEvent) => {
		onCapsLockChange(event.getModifierState("CapsLock"));
	};

	return (
		<div className="relative w-full transition-transform duration-300 ease-out-quint focus-within:-translate-y-0.5 motion-reduce:transition-none">
			<input
				type={isRevealed ? "text" : "password"}
				aria-label={label}
				placeholder={label}
				autoComplete={autoComplete}
				autoFocus={autoFocus}
				spellCheck={false}
				disabled={isDisabled}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onKeyUp={handleKeyUp}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				className={cn(
					"h-14.5 w-full rounded-[18px] bg-card pl-5 font-mono text-[17px] tracking-[0.08em] shadow-pop ring-1 ring-border transition-[box-shadow] duration-250 ease-out-quint outline-none placeholder:font-sans placeholder:text-[15px] placeholder:tracking-normal placeholder:text-subtle focus:ring-2 focus:ring-primary focus:placeholder:opacity-60 disabled:opacity-70",
					submit ? "pr-26" : "pr-14",
					!isRevealed && "text-transparent caret-transparent",
					isInvalid &&
						"ring-2 ring-destructive focus:ring-destructive",
				)}
			/>

			{!isRevealed && (
				<div
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-y-0 left-5 flex items-center gap-[7px] overflow-hidden",
						submit ? "right-26" : "right-14",
						value.length > VISIBLE_DOT_COUNT && "justify-end",
					)}
				>
					{Array.from(value, (_, index) => (
						<i
							key={index}
							className="size-2.25 shrink-0 rounded-full bg-foreground motion-safe:animate-[dial-dot-in_0.3s_var(--ease-pop)_both]"
						/>
					))}
					{isFocused && (
						<span className="h-5.5 w-0.5 shrink-0 rounded-full bg-primary motion-safe:animate-[caret-blink_1s_steps(1)_infinite]" />
					)}
				</div>
			)}

			<button
				type="button"
				aria-label={isRevealed ? `Hide ${label}` : `Show ${label}`}
				onClick={() => setIsRevealed(!isRevealed)}
				className={cn(
					"absolute top-3 grid size-8.5 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
					submit ? "right-14.5" : "right-3",
				)}
			>
				{isRevealed ? (
					<EyeOff className="size-4" />
				) : (
					<Eye className="size-4" />
				)}
			</button>

			{submit && (
				<button
					type="submit"
					aria-label="Unlock"
					disabled={submit.isBusy}
					className={cn(
						"absolute top-1.75 right-1.75 grid size-11 place-items-center overflow-hidden rounded-[13px] transition-[background-color,color,box-shadow,transform] duration-250 ease-out-quint active:scale-93",
						isReady
							? "bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_var(--primary)] after:absolute after:inset-y-0 after:left-0 after:w-[45%] after:bg-linear-to-r after:from-transparent after:via-white/50 after:to-transparent after:content-[''] hover:bg-primary/90 motion-safe:after:animate-[button-shine_0.8s_var(--ease-out-quint)_both]"
							: "bg-accent text-subtle",
					)}
				>
					<ArrowRight
						className={cn(
							"col-start-1 row-start-1 size-4 transition-[transform,opacity] duration-300 ease-out-quint",
							submit.isBusy && "translate-x-6 opacity-0",
						)}
					/>
					<Loader2
						className={cn(
							"col-start-1 row-start-1 size-4 animate-spin transition-opacity duration-200",
							!submit.isBusy && "opacity-0",
						)}
					/>
				</button>
			)}
		</div>
	);
};

export { MasterPasswordField };
