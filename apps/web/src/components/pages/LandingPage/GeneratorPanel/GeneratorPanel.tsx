import { generatePassphrase, generatePassword } from "business-logic-secure";
import { Check, Copy, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
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
					? "bg-card text-foreground shadow-panel"
					: "text-muted-foreground hover:text-foreground",
			)}
		>
			{label}
		</button>
	);
};

const GeneratorPanel: React.FC = () => {
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
		<section className="mx-auto grid max-w-6xl gap-12 px-5 pt-28 sm:px-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-16 lg:pt-40">
			<motion.div {...revealProps({})}>
				<p className="text-sm font-medium text-primary">Generator</p>
				<h2 className="mt-4 text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-5xl">
					Need a better one? Make it here.
				</h2>
				<p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
					The same generator the vault uses, running on your device.
					Nothing on this page is saved or sent.
				</p>
			</motion.div>

			<motion.div
				{...revealProps({ delay: 0.08 })}
				className="self-end rounded-[1.75rem] bg-accent/70 p-2 sm:p-3"
			>
				<div className="rounded-[1.25rem] bg-card p-5 shadow-panel sm:p-7">
					<p className="min-h-16 font-mono text-xl leading-8 tracking-tight break-all sm:text-2xl sm:leading-9">
						{secret}
					</p>

					<div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
							<div className="flex rounded-lg bg-accent p-0.5">
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
							</div>
							<div className="flex items-center rounded-lg bg-accent p-0.5">
								{MODES[mode].sizes.map((option) => (
									<ChoiceButton
										key={option}
										label={String(option)}
										isActive={size === option}
										onSelect={() => setSize(option)}
									/>
								))}
							</div>
							<span className="text-xs text-subtle">
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
				</div>
			</motion.div>
		</section>
	);
};

export { GeneratorPanel };
