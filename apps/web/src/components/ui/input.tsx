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

function PasswordInput({
	className,
	label,
	id,
	error,
	...props
}: PasswordInputProps) {
	const [showPassword, setShowPassword] = React.useState(false);
	const generatedId = React.useId();
	const inputId = id || generatedId;

	const inputElement = (
		<div className="space-y-2">
			<div className="relative">
				<Input
					id={inputId}
					type={showPassword ? "text" : "password"}
					className={cn(
						"pr-10",

						className,
					)}
					aria-invalid={!!error}
					{...props}
				/>
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

export { Input, PasswordInput };
