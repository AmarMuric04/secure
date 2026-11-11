import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
}

interface ToastContextType {
	toasts: Toast[];
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
	undefined,
);

export function useToast() {
	const context = React.useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<Toast[]>([]);

	const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).slice(2);
		setToasts((prev) => [...prev, { ...toast, id }]);

		// Auto remove after duration
		const duration = toast.duration ?? 5000;
		if (duration > 0) {
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			}, duration);
		}
	}, []);

	const removeToast = React.useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
			{children}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ToastContext.Provider>
	);
}

function ToastContainer({
	toasts,
	onRemove,
}: {
	toasts: Toast[];
	onRemove: (id: string) => void;
}) {
	if (toasts.length === 0) return null;

	return (
		<div className="fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
			))}
		</div>
	);
}

function ToastItem({
	toast,
	onRemove,
}: {
	toast: Toast;
	onRemove: (id: string) => void;
}) {
	const icons = {
		success: <CheckCircle className="size-4.5 text-success" />,
		error: <XCircle className="size-4.5 text-destructive" />,
		warning: <AlertCircle className="size-4.5 text-warning" />,
		info: <Info className="size-4.5 text-muted-foreground" />,
	};

	return (
		<div
			className={cn(
				"rounded-xl bg-popover p-3.5 shadow-pop",
				"animate-in duration-300 ease-out-quint fade-in slide-in-from-bottom-3",
			)}
		>
			<div className="flex items-start gap-3">
				{icons[toast.type]}
				<div className="min-w-0 flex-1">
					<p className="text-sm font-medium text-foreground">
						{toast.title}
					</p>
					{toast.message && (
						<p className="mt-0.5 text-sm text-muted-foreground">
							{toast.message}
						</p>
					)}
				</div>
				<button
					type="button"
					aria-label="Dismiss"
					onClick={() => onRemove(toast.id)}
					className="text-subtle transition-colors hover:text-foreground"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
