import { Link } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
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
					description="Every entry is encrypted in this browser before it reaches our server."
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
						<label className="mt-1 flex cursor-pointer items-start gap-3 border-t border-foreground/15 pt-5 text-sm">
							<Checkbox
								checked={hasAgreed}
								className="mt-0.5 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background"
								onCheckedChange={(checked) =>
									setHasAgreed(checked === true)
								}
							/>
							<span className="leading-relaxed text-muted-foreground">
								I understand my master password encrypts my
								vault on this device, and that Sealed can’t
								reset it if I forget it.
							</span>
						</label>
						<Button
							type="submit"
							variant="ink"
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
							className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
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
