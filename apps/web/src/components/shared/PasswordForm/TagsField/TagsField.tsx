import { addTag } from "business-logic-secure";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

import { EASE_OUT } from "@/lib/motion";

const TagsField: React.FC<{
	tags: string[];
	onChange: (tags: string[]) => void;
}> = ({ tags, onChange }) => {
	const [draft, setDraft] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleAdd = () => {
		onChange(addTag({ tags, tag: draft }));
		setDraft("");
	};

	const handleRemove = (removed: string) => {
		onChange(tags.filter((tag) => tag !== removed));
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Backspace" && !draft && tags.length > 0) {
			onChange(tags.slice(0, -1));

			return;
		}

		if (event.key !== "Enter" && event.key !== ",") {
			return;
		}

		event.preventDefault();
		handleAdd();
	};

	const handleBlur = () => {
		if (draft.trim()) {
			handleAdd();
		}
	};

	return (
		<div
			onClick={() => inputRef.current?.focus()}
			className="flex min-h-10 cursor-text flex-wrap items-center gap-1.5 py-1.5"
		>
			<AnimatePresence initial={false}>
				{tags.map((tag) => (
					<motion.span
						key={tag}
						layout
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{ duration: 0.2, ease: EASE_OUT }}
						className="flex h-6.5 items-center gap-0.5 rounded-full bg-accent pr-0.5 pl-2.5 text-[13px] font-medium"
					>
						{tag}
						<button
							type="button"
							aria-label={`Remove tag ${tag}`}
							onClick={() => handleRemove(tag)}
							className="grid size-5 place-items-center rounded-full text-subtle transition-colors hover:bg-input hover:text-foreground"
						>
							<X className="size-3" />
						</button>
					</motion.span>
				))}
			</AnimatePresence>
			<input
				ref={inputRef}
				id="entry-tags"
				placeholder={
					tags.length > 0 ? "Add another" : "Add tags, press Enter"
				}
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				className="h-6.5 min-w-28 flex-1 bg-transparent text-base outline-none placeholder:text-subtle md:text-sm"
			/>
		</div>
	);
};

export { TagsField };
