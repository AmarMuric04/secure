import {
	DEFAULT_PASSPHRASE_OPTIONS,
	DEFAULT_PASSWORD_OPTIONS,
	generatePassphrase,
	generatePassword,
	hasCharacterSet,
} from "business-logic-secure";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { GeneratedPreview } from "./GeneratedPreview";
import { PassphraseOptions } from "./PassphraseOptions";
import { PasswordOptions } from "./PasswordOptions";

const MODES = [
	{ value: "password", label: "Password" },
	{ value: "passphrase", label: "Passphrase" },
] as const;

const readGenerated = ({
	mode,
	passwordOptions,
	passphraseOptions,
}: {
	mode: (typeof MODES)[number]["value"];
	passwordOptions: typeof DEFAULT_PASSWORD_OPTIONS;
	passphraseOptions: typeof DEFAULT_PASSPHRASE_OPTIONS;
}) => {
	if (mode === "passphrase") {
		return generatePassphrase(passphraseOptions);
	}

	if (!hasCharacterSet(passwordOptions)) {
		return null;
	}

	try {
		return generatePassword(passwordOptions);
	} catch {
		return null;
	}
};

const PasswordGenerator: React.FC<{ onGenerate: (value: string) => void }> = ({
	onGenerate,
}) => {
	const [mode, setMode] = useState<(typeof MODES)[number]["value"]>(
		MODES[0].value,
	);
	const [passwordOptions, setPasswordOptions] = useState(
		DEFAULT_PASSWORD_OPTIONS,
	);
	const [passphraseOptions, setPassphraseOptions] = useState(
		DEFAULT_PASSPHRASE_OPTIONS,
	);
	const [preview, setPreview] = useState(() =>
		readGenerated({ mode, passwordOptions, passphraseOptions }),
	);

	const handleModeChange = (nextMode: (typeof MODES)[number]["value"]) => {
		setMode(nextMode);
		setPreview(
			readGenerated({
				mode: nextMode,
				passwordOptions,
				passphraseOptions,
			}),
		);
	};

	const handlePasswordOptionsChange = (
		options: typeof DEFAULT_PASSWORD_OPTIONS,
	) => {
		setPasswordOptions(options);
		setPreview(
			readGenerated({
				mode,
				passwordOptions: options,
				passphraseOptions,
			}),
		);
	};

	const handlePassphraseOptionsChange = (
		options: typeof DEFAULT_PASSPHRASE_OPTIONS,
	) => {
		setPassphraseOptions(options);
		setPreview(
			readGenerated({
				mode,
				passwordOptions,
				passphraseOptions: options,
			}),
		);
	};

	const handleRegenerate = () => {
		setPreview(readGenerated({ mode, passwordOptions, passphraseOptions }));
	};

	const handleUse = () => {
		if (preview) {
			onGenerate(preview);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div
				role="radiogroup"
				aria-label="Generator mode"
				className="relative grid grid-cols-2 rounded-lg bg-accent p-0.5"
			>
				{MODES.map(({ value, label }) => (
					<button
						key={value}
						type="button"
						role="radio"
						aria-checked={mode === value}
						onClick={() => handleModeChange(value)}
						className={cn(
							"relative h-7 rounded-md text-[13px] font-medium transition-colors duration-200",
							mode === value
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{mode === value && (
							<motion.span
								layoutId="generator-mode"
								transition={{
									type: "spring",
									stiffness: 500,
									damping: 38,
								}}
								className="absolute inset-0 rounded-md bg-card shadow-panel"
							/>
						)}
						<span className="relative">{label}</span>
					</button>
				))}
			</div>

			<GeneratedPreview
				value={preview}
				onRegenerate={handleRegenerate}
				onUse={handleUse}
			/>

			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={mode}
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -6 }}
					transition={{ duration: 0.2, ease: EASE_OUT }}
				>
					{mode === "passphrase" ? (
						<PassphraseOptions
							options={passphraseOptions}
							onChange={handlePassphraseOptionsChange}
						/>
					) : (
						<PasswordOptions
							options={passwordOptions}
							onChange={handlePasswordOptionsChange}
						/>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

export { PasswordGenerator };
