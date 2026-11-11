import { Link, useNavigate } from "@tanstack/react-router";
import { secure, type toPasswordEntryFields } from "business-logic-secure";
import { ArrowLeft } from "lucide-react";

import { PasswordForm } from "@/components/shared/PasswordForm";
import { useToast } from "@/components/ui";

const NewPasswordPage: React.FC = () => {
	const navigate = useNavigate();
	const { addToast } = useToast();
	const createPassword = secure.vault.useCreatePassword();

	const handleSubmit = (fields: ReturnType<typeof toPasswordEntryFields>) => {
		createPassword.mutate(
			{ ...fields, isCompromised: false },
			{
				onSuccess: () => {
					addToast({
						type: "success",
						title: "Password saved",
						message: "Your password has been encrypted and stored",
					});
					void navigate({ to: "/vault" });
				},
			},
		);
	};

	const handleCancel = () => {
		void navigate({ to: "/vault" });
	};

	return (
		<PasswordForm
			eyebrow="New login"
			leading={
				<Link
					to="/vault"
					className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-3.5" />
					Vault
				</Link>
			}
			submitLabel="Save"
			isSaving={createPassword.isPending}
			error={createPassword.error?.message}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	);
};

export { NewPasswordPage };
