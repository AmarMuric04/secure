import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { revealProps } from "../../landingMotion";
import { createPreviewKey, sealPreview } from "../../sealPreview";

const SAMPLE_TEXT = "my bank PIN is 4821";

const SealDemo: React.FC = () => {
	const keyRef = useRef<Promise<CryptoKey> | null>(null);

	const [text, setText] = useState(SAMPLE_TEXT);
	const [ciphertext, setCiphertext] = useState("");

	useEffect(() => {
		let isCurrent = true;

		keyRef.current ??= createPreviewKey();

		void keyRef.current
			.then((key) => sealPreview({ key, text }))
			.then((sealed) => {
				if (isCurrent) {
					setCiphertext(sealed);
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [text]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setText(event.target.value);
	};

	return (
		<motion.div
			{...revealProps({ delay: 0.1 })}
			className="mt-16 rounded-[1.75rem] bg-accent/70 p-2 sm:mt-20 sm:p-3"
		>
			<div className="grid overflow-hidden rounded-[1.25rem] bg-card shadow-panel md:grid-cols-2">
				<div className="p-6 sm:p-8">
					<label
						htmlFor="seal-demo"
						className="text-sm font-medium tracking-tight"
					>
						Type something secret
					</label>
					<input
						id="seal-demo"
						value={text}
						maxLength={64}
						autoComplete="off"
						spellCheck={false}
						placeholder="Anything at all"
						onChange={handleChange}
						className="mt-4 h-12 w-full border-b border-input bg-transparent font-mono text-lg transition-colors outline-none placeholder:font-sans placeholder:text-subtle focus:border-foreground"
					/>
					<p className="mt-5 text-sm leading-relaxed text-pretty text-muted-foreground">
						Sealed in this tab with a throwaway key. Your real vault
						works the same way, except its key can only be unwrapped
						with your master password.
					</p>
				</div>

				<div className="border-t border-border bg-muted p-6 sm:p-8 md:border-t-0 md:border-l">
					<p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<span className="text-sm font-medium tracking-tight">
							What our server would store
						</span>
						<span className="font-mono text-xs text-subtle">
							AES-256-GCM, new IV each time
						</span>
					</p>
					<p
						aria-live="polite"
						className="mt-4 font-mono text-[13px] leading-6 break-all text-muted-foreground"
					>
						{ciphertext}
					</p>
				</div>
			</div>
		</motion.div>
	);
};

export { SealDemo };
