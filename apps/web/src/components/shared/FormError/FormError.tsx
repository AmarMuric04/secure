import { AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

const FormError: React.FC<{ message: string | null | undefined }> = ({
	message,
}) => {
	return (
		<AnimatePresence initial={false}>
			{message && (
				<motion.div
					key={message}
					role="alert"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.25, ease: EASE_OUT }}
					className="overflow-hidden"
				>
					<p className="flex items-start gap-2 text-sm text-destructive">
						<AlertCircle className="mt-0.5 size-4 shrink-0" />
						{message}
					</p>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export { FormError };
