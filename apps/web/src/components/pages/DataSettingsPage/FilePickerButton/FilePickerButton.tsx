import { useRef } from "react";

import { Button } from "@/components/ui";

const FilePickerButton: React.FC<{
	label: string;
	accept: string;
	icon: React.ReactNode;
	isDisabled: boolean;
	onFile: (file: File) => void;
}> = ({ label, accept, icon, isDisabled, onFile }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		event.target.value = "";

		if (file) {
			onFile(file);
		}
	};

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
				onChange={handleChange}
			/>
			<Button
				variant="outline"
				size="sm"
				disabled={isDisabled}
				onClick={() => inputRef.current?.click()}
			>
				{icon}
				{label}
			</Button>
		</>
	);
};

export { FilePickerButton };
