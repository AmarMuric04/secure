import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

import { StuckDial } from "./StuckDial";

const NotFoundPage: React.FC = () => {
	return (
		<main className="flex min-h-svh items-center justify-center bg-background p-6">
			<div className="flex max-w-sm flex-col items-center text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, ease: EASE_OUT }}
				>
					<StuckDial />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.45,
						delay: 0.12,
						ease: EASE_OUT,
					}}
					className="mt-10 flex flex-col items-center"
				>
					<h1 className="text-2xl font-semibold tracking-tight">
						Wrong combination
					</h1>
					<p className="mt-2 text-muted-foreground">
						No page opens at this address. It may have moved, or it
						never existed.
					</p>
					<Button asChild variant="outline" className="mt-8">
						<Link to="/vault">
							<ArrowLeft />
							Back to your vault
						</Link>
					</Button>
				</motion.div>
			</div>
		</main>
	);
};

export { NotFoundPage };
