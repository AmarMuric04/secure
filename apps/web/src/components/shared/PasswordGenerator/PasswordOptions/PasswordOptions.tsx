import type { DEFAULT_PASSWORD_OPTIONS } from "business-logic-secure";

import { Input } from "@/components/ui";

import { OptionChip } from "../OptionChip";
import { RangeField } from "../RangeField";

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;
const CHARACTER_SET_OPTIONS = [
	{ key: "uppercase", label: "A–Z", hint: "Uppercase letters" },
	{ key: "lowercase", label: "a–z", hint: "Lowercase letters" },
	{ key: "numbers", label: "0–9", hint: "Numbers" },
	{ key: "symbols", label: "!@#$", hint: "Symbols" },
	{
		key: "excludeAmbiguous",
		label: "No look-alikes",
		hint: "Skip O, 0, I, l and 1",
	},
] as const;

const PasswordOptions: React.FC<{
	options: typeof DEFAULT_PASSWORD_OPTIONS;
	onChange: (options: typeof DEFAULT_PASSWORD_OPTIONS) => void;
}> = ({ options, onChange }) => {
	const handleExcludeChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		onChange({ ...options, excludeCharacters: event.target.value });
	};

	return (
		<div className="flex flex-col gap-4">
			<RangeField
				id="password-length"
				label="Length"
				min={MIN_LENGTH}
				max={MAX_LENGTH}
				value={options.length}
				onChange={(length) => onChange({ ...options, length })}
			/>

			<div className="flex flex-wrap gap-1.5">
				{CHARACTER_SET_OPTIONS.map(({ key, label, hint }) => (
					<OptionChip
						key={key}
						label={label}
						hint={hint}
						checked={options[key]}
						onCheckedChange={(checked) =>
							onChange({ ...options, [key]: checked })
						}
					/>
				))}
			</div>

			<div className="flex items-center gap-4">
				<label
					htmlFor="password-exclude"
					className="w-17 shrink-0 text-[13px] font-medium text-muted-foreground"
				>
					Exclude
				</label>
				<Input
					id="password-exclude"
					placeholder="Characters to leave out, e.g. {}[]"
					className="h-8 font-mono"
					value={options.excludeCharacters}
					onChange={handleExcludeChange}
				/>
			</div>
		</div>
	);
};

export { PasswordOptions };
