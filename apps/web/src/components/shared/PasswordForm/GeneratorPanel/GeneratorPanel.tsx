import { Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { PasswordGenerator } from "@/components/shared/PasswordGenerator";
import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

const GeneratorPanel: React.FC<{
	isOpen: boolean;
	onGenerate: (value: string) => void;
	onClose: () => void;
}> = ({ isOpen, onGenerate, onClose }) => {
	return (
		<AnimatePresence initial={false}>
			{isOpen && (
				<motion.section
					aria-label="Password generator"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.32, ease: EASE_OUT }}
					className="overflow-hidden"
				>
					<div className="mt-3 rounded-2xl bg-muted p-3 ring-1 ring-border">
						<div className="mb-3 flex items-center justify-between pl-1">
							<h2 className="flex items-center gap-1.5 text-[13px] font-medium">
								<Sparkles className="size-3.5 text-primary" />
								Generator
							</h2>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="Close generator"
								onClick={onClose}
							>
								<X />
							</Button>
						</div>
						<PasswordGenerator onGenerate={onGenerate} />
					</div>
				</motion.section>
			)}
		</AnimatePresence>
	);
};

export { GeneratorPanel };
