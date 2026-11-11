import {
	type decryptVault,
	secure,
	toRestoredEntry,
} from "business-logic-secure";
import { formatRelativeTime } from "formatting-service";
import { ChevronDown, History } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { useToast } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { FieldRow } from "../FieldRow";

const PasswordHistory: React.FC<{
	entry: Awaited<ReturnType<typeof decryptVault>>["passwords"][number];
}> = ({ entry }) => {
	const updatePassword = secure.vault.useUpdatePassword();
	const { addToast } = useToast();

	const [isOpen, setIsOpen] = useState(false);

	const history = entry.passwordHistory;

	const handleRestore = (historyIndex: number) => {
		updatePassword.mutate(
			toRestoredEntry({ entry, historyIndex, now: Date.now() }),
			{
				onSuccess: () =>
					addToast({
						type: "success",
						title: "Password restored",
						message: "The previous password is current again",
					}),
				onError: (error) =>
					addToast({
						type: "error",
						title: "Restore failed",
						message: error.message,
					}),
			},
		);
	};

	if (history.length === 0) {
		return null;
	}

	return (
		<div className="mb-3 rounded-xl bg-muted">
			<button
				type="button"
				aria-expanded={isOpen}
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<History className="size-4" />
				<span className="flex-1">
					Previous passwords
					<span className="ml-2 font-mono text-xs text-subtle">
						{history.length}
					</span>
				</span>
				<ChevronDown
					className={cn(
						"size-4 transition-transform duration-300 ease-out-quint",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: EASE_OUT }}
						className="overflow-hidden border-t"
					>
						{history.map((item, index) => (
							<FieldRow
								key={`${item.changedAt}-${index}`}
								label={`Replaced ${formatRelativeTime(item.changedAt)}`}
								value={item.password}
								isSecret
							>
								<button
									type="button"
									disabled={updatePassword.isPending}
									onClick={() => handleRestore(index)}
									className="mt-1 text-xs font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
								>
									Restore this password
								</button>
							</FieldRow>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export { PasswordHistory };
