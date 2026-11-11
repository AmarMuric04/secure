import { useState } from "react";

import { Button, Modal } from "@/components/ui";

import { CategoryFields } from "../CategoryFields";
import { CategoryIcon } from "../CategoryIcon";

const CategoryFormModal: React.FC<{
	title: string;
	submitLabel: string;
	initialValues: { name: string; icon: string; color: string };
	isSubmitting: boolean;
	onSubmit: (values: { name: string; icon: string; color: string }) => void;
	onClose: () => void;
}> = ({
	title,
	submitLabel,
	initialValues,
	isSubmitting,
	onSubmit,
	onClose,
}) => {
	const [name, setName] = useState(initialValues.name);
	const [icon, setIcon] = useState(initialValues.icon);
	const [color, setColor] = useState(initialValues.color);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		onSubmit({ name, icon, color });
	};

	return (
		<Modal isOpen title={title} onClose={onClose}>
			<form className="space-y-6" onSubmit={handleSubmit}>
				<div className="flex items-center gap-3">
					<CategoryIcon icon={icon} color={color} />
					<input
						aria-label="Name"
						placeholder="Category name"
						autoFocus
						value={name}
						onChange={(event) => setName(event.target.value)}
						className="h-10 min-w-0 flex-1 border-b border-input bg-transparent text-lg font-medium tracking-tight outline-none placeholder:text-subtle focus:border-primary"
					/>
				</div>

				<CategoryFields
					icon={icon}
					color={color}
					onIconChange={setIcon}
					onColorChange={setColor}
				/>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" isLoading={isSubmitting}>
						{submitLabel}
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export { CategoryFormModal };
