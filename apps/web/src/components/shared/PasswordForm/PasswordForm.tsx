import {
	readPasswordFormError,
	toPasswordEntryFields,
	toPasswordFormValues,
} from "business-logic-secure";
import { motion } from "motion/react";
import { useState } from "react";

import { FormError } from "@/components/shared/FormError";
import { EASE_OUT } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

import { ComposerToolbar } from "./ComposerToolbar";
import { CustomFieldsEditor } from "./CustomFieldsEditor";
import { EntryFields } from "./EntryFields";
import { EntryPreview } from "./EntryPreview";
import { GeneratorPanel } from "./GeneratorPanel";
import { NotesField } from "./NotesField";
import { TitleField } from "./TitleField";

const WIDE_LAYOUT_QUERY = "(min-width: 1280px)";
const STAGGER = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.04 } },
};
const RISE = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: EASE_OUT },
	},
};

const PasswordForm: React.FC<{
	entry?: Parameters<typeof toPasswordFormValues>[0];
	eyebrow: string;
	leading: React.ReactNode;
	submitLabel: string;
	isSaving: boolean;
	error: string | undefined;
	onSubmit: (fields: ReturnType<typeof toPasswordEntryFields>) => void;
	onCancel: () => void;
}> = ({
	entry,
	eyebrow,
	leading,
	submitLabel,
	isSaving,
	error,
	onSubmit,
	onCancel,
}) => {
	const isWideLayout = useMediaQuery(WIDE_LAYOUT_QUERY);

	const [values, setValues] = useState(() => toPasswordFormValues(entry));
	const [validationError, setValidationError] = useState<string | null>(null);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isGeneratorOpen, setIsGeneratorOpen] = useState(!entry);

	const handleValuesChange = (changes: Partial<typeof values>) => {
		setValues((previous) => ({ ...previous, ...changes }));
	};

	const handleGenerate = (password: string) => {
		handleValuesChange({ password });
		setIsPasswordVisible(true);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		const formError = readPasswordFormError(values);
		setValidationError(formError);

		if (formError) {
			return;
		}

		onSubmit(toPasswordEntryFields(values));
	};

	const generatorPanel = (
		<GeneratorPanel
			isOpen={isGeneratorOpen}
			onGenerate={handleGenerate}
			onClose={() => setIsGeneratorOpen(false)}
		/>
	);

	return (
		<form onSubmit={handleSubmit}>
			<ComposerToolbar
				leading={leading}
				submitLabel={submitLabel}
				isSaving={isSaving}
				onCancel={onCancel}
			/>

			<div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-14">
				<motion.div
					variants={STAGGER}
					initial="hidden"
					animate="visible"
					className="min-w-0 pl-4"
				>
					<motion.p
						variants={RISE}
						className="mb-2 text-[13px] text-subtle"
					>
						{eyebrow}
					</motion.p>

					<motion.div variants={RISE}>
						<TitleField
							title={values.title}
							url={values.url}
							favorite={values.favorite}
							autoFocus={!entry}
							onTitleChange={(title) =>
								handleValuesChange({ title })
							}
							onFavoriteChange={(favorite) =>
								handleValuesChange({ favorite })
							}
						/>
					</motion.div>

					<motion.div variants={RISE} className="mt-4">
						<FormError message={validationError ?? error} />
					</motion.div>

					<motion.div variants={RISE} className="mt-4">
						<EntryFields
							values={values}
							isPasswordVisible={isPasswordVisible}
							isGeneratorOpen={isGeneratorOpen}
							inlineGenerator={
								isWideLayout ? null : generatorPanel
							}
							onChange={handleValuesChange}
							onPasswordVisibleChange={setIsPasswordVisible}
							onGeneratorToggle={() =>
								setIsGeneratorOpen(!isGeneratorOpen)
							}
						/>
					</motion.div>

					<motion.div variants={RISE}>
						<NotesField
							value={values.notes}
							onChange={(notes) => handleValuesChange({ notes })}
						/>
					</motion.div>

					<motion.div variants={RISE}>
						<CustomFieldsEditor
							fields={values.customFields}
							onChange={(customFields) =>
								handleValuesChange({ customFields })
							}
						/>
					</motion.div>
				</motion.div>

				{isWideLayout && (
					<motion.aside
						initial={{ opacity: 0, x: 12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							duration: 0.45,
							delay: 0.1,
							ease: EASE_OUT,
						}}
						className="sticky top-0 self-start"
					>
						<EntryPreview values={values} />
						{generatorPanel}
					</motion.aside>
				)}
			</div>
		</form>
	);
};

export { PasswordForm };
