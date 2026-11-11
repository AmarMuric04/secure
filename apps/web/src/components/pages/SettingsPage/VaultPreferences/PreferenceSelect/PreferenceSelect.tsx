import { useId } from "react";

import { SettingsRow } from "@/components/shared/SettingsSection";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";

const PreferenceSelect: React.FC<{
	label: string;
	description: string;
	value: string;
	options: readonly { value: string; label: string }[];
	isDisabled?: boolean;
	onChange: (value: string) => void;
}> = ({ label, description, value, options, isDisabled, onChange }) => {
	const labelId = useId();

	return (
		<SettingsRow label={label} description={description} labelId={labelId}>
			<Select
				value={value}
				disabled={isDisabled}
				onValueChange={onChange}
			>
				<SelectTrigger
					aria-labelledby={labelId}
					className="w-full sm:w-40"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent align="end">
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</SettingsRow>
	);
};

export { PreferenceSelect };
