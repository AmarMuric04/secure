import { parseTotpSecret } from "business-logic-secure";
import { CircleCheck, CircleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const TotpStatus: React.FC<{ value: string }> = ({ value }) => {
	if (!value.trim()) {
		return (
			<p className="pb-2 text-xs text-subtle">
				Paste the setup key or otpauth:// link from the site’s 2FA
				screen.
			</p>
		);
	}

	const parsed = parseTotpSecret(value);

	if (!parsed) {
		return (
			<p className="flex items-center gap-1.5 pb-2 text-xs text-destructive">
				<CircleAlert className="size-3.5" />
				Not a valid 2FA secret
			</p>
		);
	}

	return (
		<p className="flex items-center gap-1.5 pb-2 text-xs text-muted-foreground">
			<CircleCheck className="size-3.5 text-primary" />
			{[
				parsed.issuer,
				`${parsed.digits} digits`,
				`every ${parsed.period}s`,
			]
				.filter(Boolean)
				.join(" · ")}
		</p>
	);
};

const TotpField: React.FC<{
	value: string;
	onChange: (value: string) => void;
}> = ({ value, onChange }) => {
	const isInvalid = !!value.trim() && !parseTotpSecret(value);

	return (
		<div>
			<input
				id="entry-totp"
				autoComplete="off"
				spellCheck={false}
				placeholder="Setup key or otpauth:// link"
				value={value}
				aria-invalid={isInvalid}
				onChange={(event) => onChange(event.target.value)}
				className={cn(
					"h-10 w-full bg-transparent font-mono text-[14px] outline-none placeholder:font-sans placeholder:text-[15px] placeholder:text-subtle",
					isInvalid && "text-destructive",
				)}
			/>
			<TotpStatus value={value} />
		</div>
	);
};

export { TotpField };
