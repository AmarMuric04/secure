import { motion } from "motion/react";

import { EASE_OUT } from "@/lib/motion";

import { CipherCanvas } from "./CipherCanvas";
import { EncryptionDemo } from "./EncryptionDemo";
import { RotatingTagline } from "./RotatingTagline";

const AuthShowcase: React.FC = () => {
	return (
		<aside className="relative m-3 hidden overflow-hidden rounded-[28px] bg-muted ring-1 ring-border lg:block">
			<CipherCanvas />

			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_46%,var(--muted)_30%,transparent)]" />

			<div className="relative flex h-full flex-col justify-between p-10">
				<span className="inline-flex items-center gap-2 self-end rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border backdrop-blur">
					<span className="size-1.5 rounded-full bg-success" />
					Zero-knowledge encryption
				</span>

				<motion.div
					initial={{ opacity: 0, y: 16, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{
						duration: 0.6,
						delay: 0.15,
						ease: EASE_OUT,
					}}
					className="self-center"
				>
					<EncryptionDemo />
				</motion.div>

				<RotatingTagline />
			</div>
		</aside>
	);
};

export { AuthShowcase };
