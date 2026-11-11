import { RefreshCw, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

const QueryErrorState: React.FC<{
	title: string;
	message: string | undefined;
	onRetry: () => void;
}> = ({ title, message, onRetry }) => {
	return (
		<motion.div
			role="alert"
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: EASE_OUT }}
			className="flex flex-col items-center justify-center px-6 py-16 text-center"
		>
			<TriangleAlert className="mb-4 size-6 text-destructive" />
			<h2 className="font-semibold tracking-tight text-foreground">
				{title}
			</h2>
			<p className="mt-1 max-w-sm text-sm text-muted-foreground">
				{message || "Something went wrong. Please try again."}
			</p>
			<Button
				variant="outline"
				size="sm"
				className="mt-5"
				onClick={onRetry}
			>
				<RefreshCw />
				Try again
			</Button>
		</motion.div>
	);
};

export { QueryErrorState };
