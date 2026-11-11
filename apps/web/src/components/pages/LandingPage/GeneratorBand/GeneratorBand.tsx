import { generatePassphrase, generatePassword } from "business-logic-secure";
import { Check, Copy, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { ScrambleText } from "@/components/shared/ScrambleText";
import { cn } from "@/lib/utils";

import { revealProps } from "../landingMotion";

const MODES = {
	password: { label: "Password", sizes: [16, 24, 32], unit: "characters" },
	passphrase: { label: "Passphrase", sizes: [4, 5, 6], unit: "words" },
};
const COPIED_MS = 1_600;

const createSecret = ({
	mode,
	size,
}: {
	mode: keyof typeof MODES;
	size: number;
}) => {
	if (mode === "passphrase") {
		return generatePassphrase({
			wordCount: size,
			separator: "-",
			capitalize: true,
			includeNumber: true,
		});
	}

	return generatePassword({
		length: size,
		uppercase: true,
		lowercase: true,
		numbers: true,
		symbols: true,
		excludeAmbiguous: true,
		excludeCharacters: "",
	});
};

const ChoiceButton: React.FC<{
	isActive: boolean;
	label: string;
	onSelect: () => void;
}> = ({ isActive, label, onSelect }) => {
	return (
		<button
			type="button"
			aria-pressed={isActive}
			onClick={onSelect}
			className={cn(
				"h-8 rounded-md px-3 text-sm transition-colors",
				isActive
					? "bg-foreground text-background"
					: "text-muted-foreground hover:bg-sand-ink hover:text-foreground",
			)}
		>
			{label}
		</button>
	);
};

const GeneratorBand: React.FC = () => {
	const [mode, setMode] = useState<keyof typeof MODES>("password");
	const [size, setSize] = useState(24);
	const [secret, setSecret] = useState("");
	const [isCopied, setIsCopied] = useState(false);

	useEffect(() => {
		setSecret(createSecret({ mode, size }));
	}, [mode, size]);

	useEffect(() => {
		if (!isCopied) {
			return;
		}

		const timeout = window.setTimeout(() => setIsCopied(false), COPIED_MS);

		return () => window.clearTimeout(timeout);
	}, [isCopied]);

	const handleModeSelect = (nextMode: keyof typeof MODES) => {
		setMode(nextMode);
		setSize(MODES[nextMode].sizes[1] ?? size);
	};

	const handleRegenerate = () => {
		setSecret(createSecret({ mode, size }));
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText(secret);
		setIsCopied(true);
	};

	return (
		<section className="bg-sand bg-[repeating-linear-gradient(135deg,transparent_0_14px,var(--sand-ink)_14px_15px)]">
			<div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:py-32">
				<motion.div {...revealProps({})}>
					<p className="font-mono text-xs text-muted-foreground">
						Generator
					</p>
					<h2 className="mt-5 text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
						Need a better one? Make it here.
					</h2>
					<p className="mt-4 text-sm text-pretty text-muted-foreground">
						The same generator the vault uses, running on your
						device. Nothing here is saved or sent.
					</p>
				</motion.div>

				<motion.div
					{...revealProps({ delay: 0.1 })}
					className="self-center rounded-2xl bg-background p-5 shadow-panel sm:p-7"
				>
					<p className="h-24 overflow-hidden font-mono text-xl leading-8 tracking-tight break-all sm:h-18 sm:text-2xl sm:leading-9">
						<ScrambleText text={secret} durationMs={500} />
					</p>

					<div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
						<div className="flex flex-wrap items-center gap-1">
							{Object.entries(MODES).map(([key, option]) => (
								<ChoiceButton
									key={key}
									label={option.label}
									isActive={mode === key}
									onSelect={() =>
										handleModeSelect(
											key as keyof typeof MODES,
										)
									}
								/>
							))}
							<span className="mx-2 h-5 w-px bg-border" />
							{MODES[mode].sizes.map((option) => (
								<ChoiceButton
									key={option}
									label={String(option)}
									isActive={size === option}
									onSelect={() => setSize(option)}
								/>
							))}
							<span className="ml-1 w-16 text-xs text-subtle">
								{MODES[mode].unit}
							</span>
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleRegenerate}
							>
								<RefreshCw />
								New
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => void handleCopy()}
							>
								{isCopied ? <Check /> : <Copy />}
								{isCopied ? "Copied" : "Copy"}
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export { GeneratorBand };
