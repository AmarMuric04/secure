import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { motion } from "motion/react";

import { ScrambleText } from "@/components/shared/ScrambleText";
import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

const ErrorPage: React.FC<ErrorComponentProps> = ({ error, reset }) => {
	const message = error instanceof Error ? error.message : null;

	return (
		<main className="flex min-h-svh items-center justify-center bg-background p-6">
			<div className="w-full max-w-md">
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					className="font-mono text-xs tracking-wider text-destructive uppercase"
				>
					Unexpected error
				</motion.p>
				<h1 className="mt-3 font-mono text-3xl font-medium tracking-tight">
					<ScrambleText text="Something broke." />
				</h1>
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.45,
						delay: 0.5,
						ease: EASE_OUT,
					}}
				>
					<p className="mt-3 text-muted-foreground">
						This page stopped working. Your vault is untouched,
						everything stays encrypted.
					</p>
					{message && (
						<pre className="mt-6 overflow-x-auto border-l-2 border-border py-1 pl-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-subtle">
							{message}
						</pre>
					)}
					<div className="mt-8 flex gap-2">
						<Button onClick={reset}>
							<RotateCcw />
							Try again
						</Button>
						<Button asChild variant="ghost">
							<Link to="/">Go home</Link>
						</Button>
					</div>
				</motion.div>
			</div>
		</main>
	);
};

export { ErrorPage };
