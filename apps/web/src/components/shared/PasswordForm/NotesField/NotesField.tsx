const NotesField: React.FC<{
	value: string;
	onChange: (value: string) => void;
}> = ({ value, onChange }) => {
	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		onChange(event.target.value);
	};

	return (
		<section className="mt-10">
			<label
				htmlFor="entry-notes"
				className="text-[13px] font-medium text-subtle"
			>
				Notes
			</label>
			<textarea
				id="entry-notes"
				rows={3}
				placeholder="Recovery hints, account numbers, anything worth remembering"
				value={value}
				onChange={handleChange}
				className="mt-2 field-sizing-content min-h-20 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-subtle"
			/>
		</section>
	);
};

export { NotesField };
