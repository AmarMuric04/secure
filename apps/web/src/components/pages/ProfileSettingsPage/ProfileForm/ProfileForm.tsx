import { secure } from "business-logic-secure";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

import { FormError } from "@/components/shared/FormError";
import {
	SettingsRow,
	SettingsSection,
} from "@/components/shared/SettingsSection";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	Input,
} from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

const ProfileForm: React.FC<{
	initialName: string;
	email: string;
	avatarUrl: string | null;
}> = ({ initialName, email, avatarUrl }) => {
	const updateProfile = secure.user.useUpdateProfile();

	const [name, setName] = useState(initialName);
	const nameId = useId();

	const trimmedName = name.trim();
	const isUnchanged = trimmedName === initialName.trim();
	const initial = (trimmedName || email).charAt(0).toUpperCase();
	const isActionVisible = !isUnchanged || updateProfile.isSuccess;

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
		updateProfile.reset();
	};

	const handleReset = () => {
		setName(initialName);
		updateProfile.reset();
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		updateProfile.mutate({ name: trimmedName });
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="mb-10 flex items-center gap-5">
				<Avatar className="size-16 ring-1 ring-border">
					<AvatarImage
						src={avatarUrl ?? undefined}
						alt={trimmedName || email}
					/>
					<AvatarFallback className="bg-accent text-2xl font-semibold text-foreground">
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={initial}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{
									duration: 0.25,
									ease: EASE_OUT,
								}}
							>
								{initial}
							</motion.span>
						</AnimatePresence>
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<p className="truncate text-lg font-semibold tracking-tight text-foreground">
						{trimmedName || "No display name"}
					</p>
					<p className="truncate text-sm text-muted-foreground">
						{email}
					</p>
					<p className="mt-1 text-xs text-subtle">
						{avatarUrl
							? "Picture from your Google account"
							: "Picture generated from your name"}
					</p>
				</div>
			</div>

			<SettingsSection title="Details">
				<SettingsRow
					label="Display name"
					description="Shown in the sidebar and in emails"
					htmlFor={nameId}
				>
					<Input
						id={nameId}
						autoComplete="name"
						placeholder="Your name"
						className="sm:w-64"
						value={name}
						onChange={handleNameChange}
					/>
				</SettingsRow>

				<SettingsRow
					label="Email"
					description="Used to sign in. It cannot be changed."
				>
					<p className="truncate text-sm text-muted-foreground sm:max-w-64">
						{email}
					</p>
				</SettingsRow>
			</SettingsSection>

			<div className="mt-4">
				<FormError message={updateProfile.error?.message} />
			</div>

			<AnimatePresence initial={false}>
				{isActionVisible && (
					<motion.div
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.25, ease: EASE_OUT }}
						className="mt-4 flex items-center justify-end gap-2"
					>
						{!updateProfile.isSuccess && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleReset}
							>
								Discard
							</Button>
						)}
						<Button
							type="submit"
							size="sm"
							disabled={updateProfile.isSuccess}
							isLoading={updateProfile.isPending}
						>
							{updateProfile.isSuccess && <Check />}
							{updateProfile.isSuccess ? "Saved" : "Save changes"}
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</form>
	);
};

export { ProfileForm };
