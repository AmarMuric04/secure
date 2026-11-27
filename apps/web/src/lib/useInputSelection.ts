import { useState } from "react";

const useInputSelection = () => {
	const [selection, setSelection] = useState({ start: 0, end: 0 });

	const handleSelect = (event: React.SyntheticEvent<HTMLInputElement>) => {
		const input = event.currentTarget;

		setSelection({
			start: input.selectionStart ?? input.value.length,
			end: input.selectionEnd ?? input.value.length,
		});
	};

	return { selection, handleSelect };
};

export { useInputSelection };
