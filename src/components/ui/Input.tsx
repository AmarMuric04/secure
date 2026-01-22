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
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
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
  showStrength?: boolean;
  strength?: 0 | 1 | 2 | 3 | 4;
  error?: string;
}

function PasswordInput({
  className,
  label,
  id,
  showStrength,
  strength = 0,
  error,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  const inputElement = (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={inputId}
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", error && "border-red-500", className)}
          aria-invalid={!!error}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {showStrength && props.value && !error && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  level <= strength ? strengthColors[strength] : "bg-muted",
                )}
              />
            ))}
          </div>
          <p
            className={cn(
              "text-xs",
              strength <= 1
                ? "text-red-500"
                : strength === 2
                  ? "text-yellow-500"
                  : "text-green-500",
            )}
          >
            {strengthLabels[strength]}
          </p>
        </div>
      )}
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
