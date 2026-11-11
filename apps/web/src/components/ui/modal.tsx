import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
	isOpen,
	onClose,
	title,
	description,
	children,
	size = "md",
}: ModalProps) {
	const sizes = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
	};

	// Close on escape key
	React.useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 animate-in bg-foreground/25 backdrop-blur-[2px] duration-200 fade-in dark:bg-black/60"
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={cn(
					"relative mx-4 max-h-[calc(100svh-2rem)] w-full overflow-y-auto rounded-2xl bg-popover shadow-pop",
					"animate-in duration-250 ease-out-quint fade-in slide-in-from-bottom-2 zoom-in-[0.97]",
					sizes[size],
				)}
			>
				{/* Header */}
				{(title || description) && (
					<div className="px-6 pt-6 pr-14">
						{title && (
							<h2 className="text-lg font-semibold tracking-tight text-foreground">
								{title}
							</h2>
						)}
						{description && (
							<p className="mt-1 text-sm text-muted-foreground">
								{description}
							</p>
						)}
					</div>
				)}

				{/* Close button */}
				<button
					type="button"
					aria-label="Close"
					onClick={onClose}
					className="absolute top-4 right-4 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<X className="size-4" />
				</button>

				{/* Content */}
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
}

// Confirm Dialog
interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "danger" | "warning" | "info";
	isLoading?: boolean;
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "danger",
	isLoading = false,
}: ConfirmDialogProps) {
	const variantMap = {
		danger: "destructive" as const,
		warning: "outline" as const,
		info: "default" as const,
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="sm">
			<div>
				<h3 className="mb-1.5 pr-8 text-lg font-semibold tracking-tight text-foreground">
					{title}
				</h3>
				<p className="mb-6 text-sm text-muted-foreground">{message}</p>
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isLoading}
					>
						{cancelText}
					</Button>
					<Button
						variant={variantMap[variant]}
						onClick={onConfirm}
						isLoading={isLoading}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
