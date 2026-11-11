import { Link } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { KeyRound } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";

import { AuthDivider } from "@/components/shared/AuthDivider";
import { AuthStep } from "@/components/shared/AuthStep";
import { FormError } from "@/components/shared/FormError";
import { GoogleButton } from "@/components/shared/GoogleButton";
import { Button, Checkbox, Input, PasswordInput } from "@/components/ui";

import { VerifyEmailStep } from "./VerifyEmailStep";

const MIN_MASTER_PASSWORD_LENGTH = 12;

const RegisterPage: React.FC = () => {
	const register = secure.auth.useRegister();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [hasAgreed, setHasAgreed] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (password !== confirmation) {
			setValidationError("Master passwords do not match");

			return;
		}

		setValidationError(null);
		register.mutate(
			{ email, password },
			{
				onSuccess: () => {
					setPassword("");
					setConfirmation("");
				},
			},
		);
	};

	return (
		<AnimatePresence mode="wait" initial={false}>
			{register.data ? (
				<VerifyEmailStep
					key="verify"
					token={register.data.token}
					email={register.data.email}
					onBack={register.reset}
				/>
			) : (
				<AuthStep
					key="details"
					title="Create your vault"
					description="A private place for every password you own."
				>
					<GoogleButton />

					<AuthDivider label="or sign up with email" />

					<FormError
						message={validationError ?? register.error?.message}
					/>

					<form
						className="flex flex-col gap-4"
						onSubmit={handleSubmit}
					>
						<Input
							type="email"
							label="Email"
							autoComplete="username"
							placeholder="you@example.com"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
						<PasswordInput
							label="Master password"
							autoComplete="new-password"
							placeholder={`At least ${MIN_MASTER_PASSWORD_LENGTH} characters`}
							required
							minLength={MIN_MASTER_PASSWORD_LENGTH}
							value={password}
							onChange={(event) =>
								setPassword(event.target.value)
							}
						/>
						<PasswordInput
							label="Confirm master password"
							autoComplete="new-password"
							placeholder="Type it again"
							required
							minLength={MIN_MASTER_PASSWORD_LENGTH}
							value={confirmation}
							onChange={(event) =>
								setConfirmation(event.target.value)
							}
						/>
						<p className="flex gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
							<KeyRound className="mt-0.5 size-3.5 shrink-0 text-subtle" />
							Your master password encrypts your vault on this
							device. We never see it, so it cannot be reset.
						</p>
						<label className="flex cursor-pointer items-start gap-2.5 text-sm">
							<Checkbox
								checked={hasAgreed}
								className="mt-0.5"
								onCheckedChange={(checked) =>
									setHasAgreed(checked === true)
								}
							/>
							<span className="text-muted-foreground">
								I agree to the Terms of Service and Privacy
								Policy
							</span>
						</label>
						<Button
							type="submit"
							size="lg"
							className="mt-2 h-11 w-full"
							disabled={!hasAgreed}
							isLoading={register.isPending}
						>
							Create account
						</Button>
					</form>

					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
						>
							Sign in
						</Link>
					</p>
				</AuthStep>
			)}
		</AnimatePresence>
	);
};

export { RegisterPage };
