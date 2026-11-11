import type { DEFAULT_PASSPHRASE_OPTIONS } from "business-logic-secure";

import { Input } from "@/components/ui";

import { OptionChip } from "../OptionChip";
import { RangeField } from "../RangeField";

const MIN_WORDS = 3;
const MAX_WORDS = 10;

const PassphraseOptions: React.FC<{
	options: typeof DEFAULT_PASSPHRASE_OPTIONS;
	onChange: (options: typeof DEFAULT_PASSPHRASE_OPTIONS) => void;
}> = ({ options, onChange }) => {
	const handleSeparatorChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		onChange({ ...options, separator: event.target.value });
	};

	return (
		<div className="flex flex-col gap-4">
			<RangeField
				id="passphrase-words"
				label="Words"
				min={MIN_WORDS}
				max={MAX_WORDS}
				value={options.wordCount}
				onChange={(wordCount) => onChange({ ...options, wordCount })}
			/>

			<div className="flex flex-wrap gap-1.5">
				<OptionChip
					label="Capitalize"
					checked={options.capitalize}
					onCheckedChange={(capitalize) =>
						onChange({ ...options, capitalize })
					}
				/>
				<OptionChip
					label="Add a number"
					checked={options.includeNumber}
					onCheckedChange={(includeNumber) =>
						onChange({ ...options, includeNumber })
					}
				/>
			</div>

			<div className="flex items-center gap-4">
				<label
					htmlFor="passphrase-separator"
					className="w-17 shrink-0 text-[13px] font-medium text-muted-foreground"
				>
					Separator
				</label>
				<Input
					id="passphrase-separator"
					maxLength={3}
					className="h-8 w-20 text-center font-mono"
					value={options.separator}
					onChange={handleSeparatorChange}
				/>
			</div>
		</div>
	);
};

export { PassphraseOptions };
