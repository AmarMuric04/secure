import type { toPasswordFormValues } from "business-logic-secure";

import { CategoryField } from "../CategoryField";
import { FieldRow } from "../FieldRow";
import { PasswordField } from "../PasswordField";
import { TagsField } from "../TagsField";
import { TotpField } from "../TotpField";

const EntryFields: React.FC<{
	values: ReturnType<typeof toPasswordFormValues>;
	isPasswordVisible: boolean;
	isGeneratorOpen: boolean;
	inlineGenerator: React.ReactNode;
	onChange: (
		changes: Partial<ReturnType<typeof toPasswordFormValues>>,
	) => void;
	onPasswordVisibleChange: (isVisible: boolean) => void;
	onGeneratorToggle: () => void;
}> = ({
	values,
	isPasswordVisible,
	isGeneratorOpen,
	inlineGenerator,
	onChange,
	onPasswordVisibleChange,
	onGeneratorToggle,
}) => {
	return (
		<div className="border-t border-border">
			<FieldRow label="Username" htmlFor="entry-username">
				<input
					id="entry-username"
					autoComplete="off"
					spellCheck={false}
					placeholder="name@example.com"
					value={values.username}
					onChange={(event) =>
						onChange({ username: event.target.value })
					}
					className="h-10 w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
				/>
			</FieldRow>

			<FieldRow label="Password" htmlFor="entry-password" isTop>
				<PasswordField
					value={values.password}
					isVisible={isPasswordVisible}
					isGeneratorOpen={isGeneratorOpen}
					inlineGenerator={inlineGenerator}
					onChange={(password) => onChange({ password })}
					onVisibleChange={onPasswordVisibleChange}
					onGeneratorToggle={onGeneratorToggle}
				/>
			</FieldRow>

			<FieldRow label="2FA secret" htmlFor="entry-totp" isTop>
				<TotpField
					value={values.totp}
					onChange={(totp) => onChange({ totp })}
				/>
			</FieldRow>

			<FieldRow label="Website" htmlFor="entry-url">
				<input
					id="entry-url"
					inputMode="url"
					autoComplete="off"
					spellCheck={false}
					placeholder="example.com"
					value={values.url}
					onChange={(event) => onChange({ url: event.target.value })}
					className="h-10 w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
				/>
			</FieldRow>

			<FieldRow label="Category" htmlFor="entry-category">
				<CategoryField
					categoryId={values.categoryId}
					onChange={(categoryId) => onChange({ categoryId })}
				/>
			</FieldRow>

			<FieldRow label="Tags" htmlFor="entry-tags" isTop>
				<TagsField
					tags={values.tags}
					onChange={(tags) => onChange({ tags })}
				/>
			</FieldRow>
		</div>
	);
};

export { EntryFields };
