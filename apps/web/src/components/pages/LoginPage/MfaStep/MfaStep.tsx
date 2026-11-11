import { useNavigate } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { AuthStep } from "@/components/shared/AuthStep";
import { CodeInput } from "@/components/shared/CodeInput";
import { FormError } from "@/components/shared/FormError";
import { Button, Input } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";

const MfaStep: React.FC<{ mfaToken?: string }> = ({ mfaToken }) => {
	const navigate = useNavigate();
	const verifyMfa = secure.auth.useVerifyMfa();

	const [method, setMethod] = useState<"totp" | "backup">("totp");
	const [code, setCode] = useState("");

	const isComplete = method === "totp" ? code.length === 6 : code.length >= 8;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		verifyMfa.mutate(
			{ method, code, mfaToken },
			{ onSuccess: () => navigate({ to: "/vault" }) },
		);
	};

	const handleMethodToggle = () => {
		setMethod(method === "totp" ? "backup" : "totp");
		setCode("");
	};

	return (
		<AuthStep
			title="Two-factor authentication"
			description={
				method === "totp"
					? "Enter the 6-digit code from your authenticator app."
					: "Enter one of the backup codes you saved."
			}
			icon={<ShieldCheck />}
		>
			<FormError message={verifyMfa.error?.message} />

			<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={method}
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.2, ease: EASE_OUT }}
					>
						{method === "totp" ? (
							<CodeInput
								value={code}
								isDisabled={verifyMfa.isPending}
								onChange={setCode}
							/>
						) : (
							<Input
								autoComplete="one-time-code"
								aria-label="Backup code"
								placeholder="Backup code"
								className="h-12 text-center font-mono tracking-[0.2em]"
								value={code}
								onChange={(event) =>
									setCode(
										event.target.value.trim().toUpperCase(),
									)
								}
							/>
						)}
					</motion.div>
				</AnimatePresence>

				<Button
					type="submit"
					size="lg"
					className="mt-2 h-11 w-full"
					disabled={!isComplete}
					isLoading={verifyMfa.isPending}
				>
					Verify
				</Button>
			</form>

			<button
				type="button"
				className="self-start rounded-md text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
				onClick={handleMethodToggle}
			>
				{method === "totp"
					? "Use a backup code instead"
					: "Use your authenticator app instead"}
			</button>
		</AuthStep>
	);
};

export { MfaStep };
