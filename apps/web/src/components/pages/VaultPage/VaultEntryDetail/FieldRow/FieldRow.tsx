import { Copy, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import { useCopySecret } from "@/lib/useCopySecret";
import { cn } from "@/lib/utils";

const MASK_LENGTH = 16;

const FieldRow: React.FC<{
	label: string;
	value: string;
	isSecret?: boolean;
	isMultiline?: boolean;
	isCopyable?: boolean;
	href?: string;
	children?: React.ReactNode;
	onCopied?: () => void;
}> = ({
	label,
	value,
	isSecret = false,
	isMultiline = false,
	isCopyable = true,
	href,
	children,
	onCopied,
}) => {
	const copySecret = useCopySecret();

	const [isRevealed, setIsRevealed] = useState(false);

	const isMasked = isSecret && !isRevealed;

	const handleCopy = async () => {
		const isCopied = await copySecret({ value, label });

		if (isCopied && onCopied) {
			onCopied();
		}
	};

	return (
		<div className="group/field flex min-h-15.5 items-center gap-3 py-3 pr-2.5 pl-4 not-first:border-t">
			<div className="min-w-0 flex-1">
				<p className="mb-0.5 text-xs text-subtle">{label}</p>
				<p
					className={cn(
						"text-[15px]",
						isSecret && "font-mono tracking-wide",
						isMultiline
							? "leading-relaxed break-words whitespace-pre-wrap text-muted-foreground"
							: "truncate",
					)}
				>
					{isMasked
						? "•".repeat(Math.min(value.length, MASK_LENGTH))
						: value}
				</p>
				{children}
			</div>

			<div className="flex shrink-0 items-center gap-0.5 opacity-75 transition-opacity duration-200 group-hover/field:opacity-100">
				{isSecret && (
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={
							isRevealed ? `Hide ${label}` : `Show ${label}`
						}
						className="rounded-lg text-muted-foreground"
						onClick={() => setIsRevealed(!isRevealed)}
					>
						{isRevealed ? <EyeOff /> : <Eye />}
					</Button>
				)}

				{isCopyable && (
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Copy ${label}`}
						className="rounded-lg text-muted-foreground"
						onClick={() => void handleCopy()}
					>
						<Copy />
					</Button>
				)}

				{href && (
					<Button
						asChild
						variant="ghost"
						size="icon-sm"
						className="rounded-lg text-muted-foreground"
					>
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`Open ${label}`}
						>
							<ExternalLink />
						</a>
					</Button>
				)}
			</div>
		</div>
	);
};

export { FieldRow };
