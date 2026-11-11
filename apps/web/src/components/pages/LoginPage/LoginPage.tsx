import { Link, useNavigate } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { AnimatePresence } from "motion/react";
import { useState } from "react";

import { AuthDivider } from "@/components/shared/AuthDivider";
import { AuthStep } from "@/components/shared/AuthStep";
import { FormError } from "@/components/shared/FormError";
import { GoogleButton } from "@/components/shared/GoogleButton";
import { Button, Input, PasswordInput } from "@/components/ui";
import { Route } from "@/routes/_auth/login";

import { MfaStep } from "./MfaStep";

const OAUTH_ERRORS: Record<string, string> = {
	oauth_failed: "Google sign-in failed. Please try again.",
	oauth_unavailable: "Google sign-in is not configured.",
	account_exists:
		"An account with this email already exists. Sign in with your email and master password.",
	account_disabled: "Your account has been disabled.",
};

const LoginPage: React.FC = () => {
	const { step, error } = Route.useSearch();
	const navigate = useNavigate();
	const login = secure.auth.useLogin();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [mfaToken, setMfaToken] = useState<string | null>(null);

	const oauthError = error ? (OAUTH_ERRORS[error] ?? null) : null;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		login.mutate(
			{ email, password },
			{
				onSuccess: (result) => {
					setPassword("");

					if (result.status === "mfa") {
						setMfaToken(result.mfaToken);

						return;
					}

					void navigate({ to: "/vault" });
				},
			},
		);
	};

	const isMfaStep = !!mfaToken || step === "mfa";

	return (
		<AnimatePresence mode="wait" initial={false}>
			{isMfaStep ? (
				<MfaStep key="mfa" mfaToken={mfaToken ?? undefined} />
			) : (
				<AuthStep
					key="credentials"
					title="Welcome back"
					description="Sign in to open your vault."
				>
					<GoogleButton />

					<AuthDivider label="or continue with email" />

					<FormError message={login.error?.message ?? oauthError} />

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
							autoComplete="current-password"
							placeholder="Your master password"
							required
							value={password}
							onChange={(event) =>
								setPassword(event.target.value)
							}
						/>
						<Button
							type="submit"
							size="lg"
							className="mt-2 h-11 w-full"
							isLoading={login.isPending}
						>
							Sign in
						</Button>
					</form>

					<p className="text-sm text-muted-foreground">
						New to SecureVault?{" "}
						<Link
							to="/register"
							className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
						>
							Create an account
						</Link>
					</p>
				</AuthStep>
			)}
		</AnimatePresence>
	);
};

export { LoginPage };
