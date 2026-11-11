import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
	const sizes = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<Loader2
			className={cn("animate-spin text-primary", sizes[size], className)}
		/>
	);
}

interface LoadingOverlayProps {
	message?: string;
}

export function LoadingOverlay({
	message = "Loading...",
}: LoadingOverlayProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-[2px]">
			<div className="flex flex-col items-center gap-4 rounded-2xl bg-popover p-8 shadow-pop">
				<Spinner size="lg" />
				<p className="text-muted-foreground">{message}</p>
			</div>
		</div>
	);
}

interface EmptyStateProps {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center rounded-xl px-4 py-16 text-center ring-1 ring-border",
				className,
			)}
		>
			{icon && (
				<div className="mb-4 grid size-12 place-items-center rounded-xl bg-muted ring-1 ring-border [&_svg]:size-5 [&_svg]:text-muted-foreground">
					{icon}
				</div>
			)}
			<h3 className="mb-1 font-semibold tracking-tight text-foreground">
				{title}
			</h3>
			{description && (
				<p className="mb-5 max-w-sm text-sm text-muted-foreground">
					{description}
				</p>
			)}
			{action}
		</div>
	);
}
