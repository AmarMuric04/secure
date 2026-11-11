import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { ScrambleText } from "@/components/shared/ScrambleText";

import { Chapter } from "../Chapter";
import { EASE_OUT, revealProps } from "../landingMotion";
import { createPreviewKey, sealPreview } from "../sealPreview";

const SealedChapter: React.FC<{
	phrase: string;
	isEdited: boolean;
	onEdit: (phrase: string) => void;
}> = ({ phrase, isEdited, onEdit }) => {
	const keyRef = useRef<Promise<CryptoKey> | null>(null);

	const [ciphertext, setCiphertext] = useState("");

	useEffect(() => {
		let isCurrent = true;

		keyRef.current ??= createPreviewKey();

		void keyRef.current
			.then((key) => sealPreview({ key, text: phrase }))
			.then((sealed) => {
				if (isCurrent) {
					setCiphertext(sealed);
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [phrase]);

	const handleFocus = () => {
		if (!isEdited) {
			onEdit("");
		}
	};

	return (
		<Chapter
			id="sealed"
			number="01"
			label="On your device"
			title="Whatever you type here never reaches us. This is what would."
		>
			<motion.div {...revealProps({ delay: 0.05 })}>
				<label htmlFor="sealed-secret" className="text-xs text-subtle">
					Your text
				</label>
				<input
					id="sealed-secret"
					value={phrase}
					maxLength={64}
					autoComplete="off"
					spellCheck={false}
					placeholder="Type something to seal"
					onFocus={handleFocus}
					onChange={(event) => onEdit(event.target.value)}
					className="mt-2 h-14 w-full border-b border-input bg-transparent font-mono text-2xl tracking-tight transition-colors outline-none placeholder:font-sans placeholder:text-subtle focus:border-primary sm:text-3xl"
				/>
			</motion.div>

			<motion.div
				{...revealProps({ delay: 0.1 })}
				className="my-10 flex items-center gap-4"
			>
				<span className="relative h-px flex-1 bg-border">
					<motion.span
						key={phrase}
						initial={{ left: "0%", opacity: 1 }}
						animate={{ left: "100%", opacity: 0 }}
						transition={{ duration: 0.7, ease: EASE_OUT }}
						className="absolute top-1/2 size-1.5 -translate-1/2 rounded-full bg-primary"
					/>
				</span>
				<span className="shrink-0 font-mono text-xs text-muted-foreground">
					AES-256-GCM · fresh 96-bit IV
				</span>
			</motion.div>

			<motion.div {...revealProps({ delay: 0.15 })}>
				<p className="text-xs text-subtle">
					What our server would store
				</p>
				<p className="mt-3 min-h-15 font-mono text-[13px] leading-5 break-all text-muted-foreground">
					<ScrambleText text={ciphertext} durationMs={380} />
				</p>
			</motion.div>

			<motion.p
				{...revealProps({ delay: 0.2 })}
				className="mt-12 max-w-lg text-sm text-pretty text-muted-foreground"
			>
				This demo seals your text with a throwaway key made in this tab
				a moment ago. Your real vault works the same way, except the key
				can only be unwrapped with your master password, which never
				leaves the browser.
			</motion.p>
		</Chapter>
	);
};

export { SealedChapter };
