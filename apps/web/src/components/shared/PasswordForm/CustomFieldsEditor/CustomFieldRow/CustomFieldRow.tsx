import {
	CUSTOM_FIELD_TYPES,
	type toPasswordFormValues,
} from "business-logic-secure";
import { X } from "lucide-react";
import { motion } from "motion/react";

import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

const TYPE_LABELS = {
	text: "Text",
	password: "Password",
	hidden: "Hidden",
};

const CustomFieldRow: React.FC<{
	field: ReturnType<typeof toPasswordFormValues>["customFields"][number];
	onChange: (
		field: ReturnType<typeof toPasswordFormValues>["customFields"][number],
	) => void;
	onRemove: () => void;
}> = ({ field, onChange, onRemove }) => {
	const handleTypeChange = (value: string) => {
		const type = CUSTOM_FIELD_TYPES.find((option) => option === value);

		if (type) {
			onChange({ ...field, type });
		}
	};

	return (
		<motion.li
			layout
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.28, ease: EASE_OUT }}
			className="overflow-hidden"
		>
			<div className="group/custom grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 border-b border-border py-1.5 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto_auto] sm:gap-x-4">
				<input
					aria-label="Field name"
					placeholder="Name"
					value={field.name}
					onChange={(event) =>
						onChange({ ...field, name: event.target.value })
					}
					className="h-9 min-w-0 bg-transparent text-[13px] text-muted-foreground outline-none placeholder:text-subtle focus:text-foreground"
				/>

				<input
					aria-label="Field value"
					placeholder="Value"
					type={field.type === "text" ? "text" : "password"}
					autoComplete="off"
					value={field.value}
					onChange={(event) =>
						onChange({ ...field, value: event.target.value })
					}
					className="h-9 min-w-0 bg-transparent text-[15px] outline-none placeholder:text-subtle max-sm:order-last max-sm:col-span-3"
				/>

				<Select value={field.type} onValueChange={handleTypeChange}>
					<SelectTrigger
						aria-label="Field type"
						size="sm"
						className="bg-transparent px-2 text-xs text-muted-foreground ring-0 hover:bg-accent focus-visible:ring-2"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{CUSTOM_FIELD_TYPES.map((type) => (
							<SelectItem key={type} value={type}>
								{TYPE_LABELS[type]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Remove field"
					className="hover:text-destructive sm:opacity-0 sm:group-focus-within/custom:opacity-100 sm:group-hover/custom:opacity-100"
					onClick={onRemove}
				>
					<X />
				</Button>
			</div>
		</motion.li>
	);
};

export { CustomFieldRow };
