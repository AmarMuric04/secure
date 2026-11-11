import { motion } from "motion/react";
import { useId } from "react";

import { SettingsRow } from "@/components/shared/SettingsSection";
import { cn } from "@/lib/utils";

const PreferenceSwitch: React.FC<{
	label: string;
	description: string;
	isChecked: boolean;
	isDisabled?: boolean;
	onChange: (isChecked: boolean) => void;
}> = ({ label, description, isChecked, isDisabled, onChange }) => {
	const switchId = useId();

	return (
		<SettingsRow label={label} description={description} htmlFor={switchId}>
			<button
				id={switchId}
				type="button"
				role="switch"
				aria-checked={isChecked}
				disabled={isDisabled}
				onClick={() => onChange(!isChecked)}
				className={cn(
					"flex h-6 w-10.5 shrink-0 items-center rounded-full p-0.75 transition-colors duration-250 ease-out-quint outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60",
					isChecked
						? "justify-end bg-primary"
						: "justify-start bg-input",
				)}
			>
				<motion.span
					layout
					transition={{ type: "spring", stiffness: 700, damping: 38 }}
					className="h-4.5 w-4.5 rounded-full bg-card shadow-[0_1px_3px_rgb(0_0_0/0.2)]"
				/>
			</button>
		</SettingsRow>
	);
};

export { PreferenceSwitch };
