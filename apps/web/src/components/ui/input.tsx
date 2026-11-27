import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
	label?: string;
}

function Input({ className, type, label, id, ...props }: InputProps) {
	const generatedId = React.useId();
	const inputId = id || generatedId;

	const inputElement = (
		<input
			id={inputId}
			type={type}
			data-slot="input"
			className={cn(
				"h-10 w-full min-w-0 rounded-lg bg-card px-3.5 py-2 text-base ring-1 ring-input transition-[box-shadow] duration-200 ease-out-quint outline-none ring-inset selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-subtle disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:ring-2 focus-visible:ring-primary",
				"aria-invalid:ring-2 aria-invalid:ring-destructive",
				className,
			)}
			{...props}
		/>
	);

	if (label) {
		return (
			<div className="space-y-1.5">
				<label
					htmlFor={inputId}
					className="text-sm font-medium text-foreground"
				>
					{label}
				</label>
				{inputElement}
			</div>
		);
	}

	return inputElement;
}

interface PasswordInputProps extends React.ComponentProps<"input"> {
	label?: string;
	error?: string;
}

const MAX_VISIBLE_DOTS = 40;
const DOT_SIZES = {
	md: { dot: "size-1.5", slot: "px-[2.5px]", caret: "h-4.5", height: "h-5" },
	lg: { dot: "size-2.25", slot: "px-[3.5px]", caret: "h-5.5", height: "h-7" },
};

function PasswordDots({
	length,
	isFocused,
	selection,
	size = "md",
	className,
}: {
	length: number;
	isFocused: boolean;
	selection: { start: number; end: number };
	size?: keyof typeof DOT_SIZES;
	className?: string;
}) {
	const sizes = DOT_SIZES[size];
	const isCollapsed = selection.start === selection.end;
	const caret = (
		<span
			className={cn(
				"w-0.5 shrink-0 rounded-full bg-primary motion-safe:animate-[caret-blink_1s_steps(1)_infinite]",
				sizes.caret,
			)}
		/>
	);
	const showCaretAt = (index: number) =>
		isFocused && isCollapsed && selection.start === index;

	return (
		<span
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-y-0 flex items-center overflow-hidden",
				length > MAX_VISIBLE_DOTS && "justify-end",
				className,
			)}
		>
			{Array.from({ length }, (_, index) => {
				const isSelected =
					!isCollapsed &&
					index >= selection.start &&
					index < selection.end;

				return (
					<span key={index} className="flex shrink-0 items-center">
						{showCaretAt(index) && caret}
						<span
							className={cn(
								"flex shrink-0 items-center",
								sizes.slot,
								sizes.height,
								isSelected && "bg-primary/30",
								isSelected &&
									index === selection.start &&
									"rounded-l-md",
								isSelected &&
									index === selection.end - 1 &&
									"rounded-r-md",
							)}
						>
							<i
								className={cn(
									"shrink-0 rounded-full bg-foreground motion-safe:animate-[dial-dot-in_0.3s_var(--ease-pop)_both]",
									sizes.dot,
								)}
							/>
						</span>
					</span>
				);
			})}
			{showCaretAt(length) && caret}
		</span>
	);
}

function PasswordInput({
	className,
	label,
	id,
	error,
	onChange,
	onFocus,
	onBlur,
	onSelect,
	...props
}: PasswordInputProps) {
	const [showPassword, setShowPassword] = React.useState(false);
	const [isFocused, setIsFocused] = React.useState(false);
	const [uncontrolledLength, setUncontrolledLength] = React.useState(0);
	const [selection, setSelection] = React.useState({ start: 0, end: 0 });
	const generatedId = React.useId();
	const inputId = id || generatedId;

	const length =
		props.value === undefined
			? uncontrolledLength
			: String(props.value).length;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUncontrolledLength(event.target.value.length);
		onChange?.(event);
	};

	const handleSelect = (event: React.SyntheticEvent<HTMLInputElement>) => {
		const input = event.currentTarget;

		setSelection({
			start: input.selectionStart ?? input.value.length,
			end: input.selectionEnd ?? input.value.length,
		});
		onSelect?.(event);
	};

	const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(true);
		onFocus?.(event);
	};

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(false);
		onBlur?.(event);
	};

	const inputElement = (
		<div className="space-y-2">
			<div className="relative">
				<Input
					id={inputId}
					type={showPassword ? "text" : "password"}
					className={cn(
						"pr-10",
						!showPassword &&
							"text-transparent caret-transparent selection:bg-transparent selection:text-transparent",
						className,
					)}
					aria-invalid={!!error}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onSelect={handleSelect}
					{...props}
				/>
				{!showPassword && (
					<PasswordDots
						length={length}
						isFocused={isFocused}
						selection={selection}
						className="right-10 left-3"
					/>
				)}
				<button
					type="button"
					aria-label={
						showPassword ? "Hide password" : "Show password"
					}
					onClick={() => setShowPassword(!showPassword)}
					className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			</div>
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);

	if (label) {
		return (
			<div className="space-y-1.5">
				<label
					htmlFor={inputId}
					className="text-sm font-medium text-foreground"
				>
					{label}
				</label>
				{inputElement}
			</div>
		);
	}

	return inputElement;
}

export { Input, PasswordDots, PasswordInput };
