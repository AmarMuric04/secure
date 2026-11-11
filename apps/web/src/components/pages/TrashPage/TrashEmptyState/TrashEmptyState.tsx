import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SHEETS = [
	{ key: "left", rotate: -14, x: -34, y: 10, lineWidth: "w-8" },
	{ key: "right", rotate: 12, x: 34, y: 12, lineWidth: "w-10" },
	{ key: "center", rotate: -2, x: 0, y: 0, lineWidth: "w-12" },
];

const TrashEmptyState: React.FC = () => {
	return (
		<div className="flex flex-col items-center py-16 text-center">
			<div className="relative mb-9 grid h-32 w-48 place-items-center">
				<motion.span
					initial={{ scale: 0.6, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.6, ease: EASE_OUT }}
					className="absolute size-32 rounded-full border border-dashed border-input"
				/>
				<motion.span
					initial={{ scale: 0.6, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.05 }}
					className="absolute size-20 rounded-full bg-muted"
				/>

				{SHEETS.map((sheet, index) => (
					<motion.span
						key={sheet.key}
						initial={{ opacity: 0, y: 24, rotate: 0, x: 0 }}
						animate={{
							opacity: 1,
							y: sheet.y,
							rotate: sheet.rotate,
							x: sheet.x,
						}}
						transition={{
							duration: 0.6,
							ease: EASE_OUT,
							delay: 0.15 + index * 0.08,
						}}
						className="absolute flex h-16 w-13 flex-col gap-1.5 rounded-lg bg-card p-2.5 shadow-pop"
					>
						<span className="size-3 rounded-[4px] bg-accent" />
						<span
							className={cn(
								"h-1 rounded-full bg-accent",
								sheet.lineWidth,
							)}
						/>
						<span className="h-1 w-6 rounded-full bg-accent" />
					</motion.span>
				))}

				<motion.span
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: "spring",
						stiffness: 420,
						damping: 18,
						delay: 0.55,
					}}
					className="absolute right-9 bottom-2 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-pop"
				>
					<Check className="size-3.5" strokeWidth={3} />
				</motion.span>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.3 }}
				className="flex flex-col items-center"
			>
				<h2 className="font-semibold tracking-tight">
					Nothing in the trash
				</h2>
				<p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
					When you delete a password it waits here first, so you can
					bring it back if you change your mind.
				</p>
				<Button asChild variant="outline" size="sm" className="mt-5">
					<Link to="/vault">Back to vault</Link>
				</Button>
			</motion.div>
		</div>
	);
};

export { TrashEmptyState };
