import { Fragment, useRef } from "react";

const DIGIT_POSITIONS = [0, 1, 2, 3, 4, 5];

const CodeInput: React.FC<{
	value: string;
	isDisabled?: boolean;
	onChange: (value: string) => void;
}> = ({ value, isDisabled, onChange }) => {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const handleDigitChange = ({
		position,
		digit,
	}: {
		position: number;
		digit: string;
	}) => {
		if (!/^\d?$/.test(digit)) {
			return;
		}

		const digits = [...value];
		digits[position] = digit;
		onChange(digits.join("").slice(0, DIGIT_POSITIONS.length));

		if (digit) {
			inputRefs.current[position + 1]?.focus();
		}
	};

	const handleKeyDown = ({
		position,
		key,
	}: {
		position: number;
		key: string;
	}) => {
		if (key === "Backspace" && !value[position]) {
			inputRefs.current[position - 1]?.focus();
		}
	};

	const handlePaste = (event: React.ClipboardEvent) => {
		event.preventDefault();

		const pasted = event.clipboardData
			.getData("text")
			.replaceAll(/\D/g, "")
			.slice(0, DIGIT_POSITIONS.length);

		onChange(pasted);
		inputRefs.current[
			Math.min(pasted.length, DIGIT_POSITIONS.length - 1)
		]?.focus();
	};

	return (
		<div className="grid grid-cols-[repeat(3,minmax(0,1fr))_auto_repeat(3,minmax(0,1fr))] items-center gap-2">
			{DIGIT_POSITIONS.map((position) => (
				<Fragment key={position}>
					{position === 3 && (
						<span
							className="h-px w-3 bg-input"
							aria-hidden="true"
						/>
					)}
					<input
						ref={(element) => {
							inputRefs.current[position] = element;
						}}
						type="text"
						inputMode="numeric"
						autoComplete={position === 0 ? "one-time-code" : "off"}
						aria-label={`Digit ${position + 1}`}
						maxLength={1}
						value={value[position] ?? ""}
						disabled={isDisabled}
						className="h-13 w-full min-w-0 rounded-xl bg-card text-center font-mono text-xl font-medium text-foreground tabular-nums ring-1 ring-input transition-[box-shadow,transform] duration-200 ease-out-quint outline-none ring-inset focus:-translate-y-0.5 focus:ring-2 focus:ring-primary disabled:opacity-50 motion-reduce:focus:translate-y-0"
						onChange={(event) =>
							handleDigitChange({
								position,
								digit: event.target.value,
							})
						}
						onKeyDown={(event) =>
							handleKeyDown({ position, key: event.key })
						}
						onPaste={handlePaste}
					/>
				</Fragment>
			))}
		</div>
	);
};

export { CodeInput };
