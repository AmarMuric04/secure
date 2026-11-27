import { generatePassphrase, generatePassword } from "business-logic-secure";
import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

import { revealProps } from "../landingMotion";
import { SectionHeading } from "../SectionHeading";

const MODES = {
	password: { label: "Password", sizes: [16, 24, 32], unit: "characters" },
	passphrase: { label: "Passphrase", sizes: [4, 5, 6], unit: "words" },
};

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

	useEffect(() => {
		setSecret(createSecret({ mode, size }));
	}, [mode, size]);

	const handleModeSelect = (nextMode: keyof typeof MODES) => {
		setMode(nextMode);
		setSize(MODES[nextMode].sizes[1] ?? size);
	};

	const handleRegenerate = () => {
		setSecret(createSecret({ mode, size }));
	};

	return (
		<section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 lg:pt-40">
			<SectionHeading
				eyebrow="Generator"
				title="Need a better one? Make it here."
				lede="The same generator the vault uses, running on your device. Nothing on this page is saved or sent."
			/>

			<motion.div
				{...revealProps({ delay: 0.08 })}
				className="mt-14 rounded-[1.75rem] bg-accent/70 p-2 sm:mt-16 sm:p-3"
			>
				<div className="rounded-[1.25rem] bg-card p-5 shadow-panel sm:p-8">
					<p className="min-h-16 font-mono text-xl leading-8 tracking-tight break-all sm:text-3xl sm:leading-10">
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
							<CopyButton
								value={secret}
								label={MODES[mode].label}
								variant="outline"
								size="sm"
								text="Copy"
							/>
						</div>
					</div>
				</div>
			</motion.div>
		</section>
	);
};

export { GeneratorPanel };
