import { Link, useNavigate } from "@tanstack/react-router";
import {
	secure,
	toUpdatedEntry,
	type toPasswordEntryFields,
} from "business-logic-secure";
import { ArrowLeft } from "lucide-react";

import { PasswordEntryFallback } from "@/components/shared/PasswordEntryFallback";
import { PasswordForm } from "@/components/shared/PasswordForm";
import { useToast } from "@/components/ui";
import { Route } from "@/routes/vault/$id/edit";

const EditPasswordPage: React.FC = () => {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { addToast } = useToast();
	const vault = secure.vault.useVault({ includeDeleted: false });
	const updatePassword = secure.vault.useUpdatePassword();

	const entry = vault.data?.passwords.find(
		(password) => password.id === id && !password.deletedAt,
	);

	const handleSubmit = (fields: ReturnType<typeof toPasswordEntryFields>) => {
		if (!entry) {
			return;
		}

		updatePassword.mutate(
			toUpdatedEntry({ entry, fields, now: Date.now() }),
			{
				onSuccess: () => {
					addToast({
						type: "success",
						title: "Password updated",
						message: "Your changes have been encrypted and saved",
					});
					void navigate({ to: "/vault", search: { entry: id } });
				},
			},
		);
	};

	const handleCancel = () => {
		void navigate({ to: "/vault", search: { entry: id } });
	};

	const handleRetry = () => {
		void vault.refetch();
	};

	if (!entry) {
		return (
			<PasswordEntryFallback
				isPending={vault.isPending}
				error={vault.error}
				onRetry={handleRetry}
			/>
		);
	}

	return (
		<PasswordForm
			key={entry.id}
			entry={entry}
			eyebrow="Editing"
			leading={
				<Link
					to="/vault"
					search={{ entry: id }}
					className="inline-flex max-w-full items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-3.5 shrink-0" />
					<span className="truncate">{entry.title}</span>
				</Link>
			}
			submitLabel="Save changes"
			isSaving={updatePassword.isPending}
			error={updatePassword.error?.message}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	);
};

export { EditPasswordPage };
