import {
	createCustomField,
	type toPasswordFormValues,
} from "business-logic-secure";
import { Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";

import { CustomFieldRow } from "./CustomFieldRow";

const CustomFieldsEditor: React.FC<{
	fields: ReturnType<typeof toPasswordFormValues>["customFields"];
	onChange: (
		fields: ReturnType<typeof toPasswordFormValues>["customFields"],
	) => void;
}> = ({ fields, onChange }) => {
	const handleAdd = () => {
		onChange([...fields, createCustomField()]);
	};

	const handleFieldChange = (
		changed: ReturnType<
			typeof toPasswordFormValues
		>["customFields"][number],
	) => {
		onChange(
			fields.map((field) =>
				field.key === changed.key ? changed : field,
			),
		);
	};

	const handleRemove = (key: string) => {
		onChange(fields.filter((field) => field.key !== key));
	};

	return (
		<section className="mt-10">
			<div className="flex items-center justify-between">
				<h2 className="text-[13px] font-medium text-subtle">
					Extra fields
				</h2>
				<button
					type="button"
					onClick={handleAdd}
					className="-mr-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<Plus className="size-3.5" />
					Add field
				</button>
			</div>

			{fields.length === 0 && (
				<p className="mt-1 text-sm text-subtle">
					PINs, security questions, account numbers.
				</p>
			)}

			<ul className="mt-1">
				<AnimatePresence initial={false}>
					{fields.map((field) => (
						<CustomFieldRow
							key={field.key}
							field={field}
							onChange={handleFieldChange}
							onRemove={() => handleRemove(field.key)}
						/>
					))}
				</AnimatePresence>
			</ul>
		</section>
	);
};

export { CustomFieldsEditor };
