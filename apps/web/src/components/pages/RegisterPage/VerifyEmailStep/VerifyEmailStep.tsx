import { useNavigate } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";

import { AuthStep } from "@/components/shared/AuthStep";
import { CodeInput } from "@/components/shared/CodeInput";
import { FormError } from "@/components/shared/FormError";
import { Button } from "@/components/ui";

const VerifyEmailStep: React.FC<{
	token: string;
	email: string;
	onBack: () => void;
}> = ({ token, email, onBack }) => {
	const navigate = useNavigate();
	const confirmRegistration = secure.auth.useConfirmRegistration();

	const [code, setCode] = useState("");

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		confirmRegistration.mutate(
			{ token, code },
			{ onSuccess: () => navigate({ to: "/vault" }) },
		);
	};

	return (
		<AuthStep
			title="Check your email"
			description={
				<>
					We sent a 6-digit code to{" "}
					<span className="font-medium break-all text-foreground">
						{email}
					</span>
				</>
			}
			icon={<Mail />}
		>
			<FormError message={confirmRegistration.error?.message} />

			<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
				<p className="sr-only">Enter verification code</p>
				<CodeInput
					value={code}
					isDisabled={confirmRegistration.isPending}
					onChange={setCode}
				/>

				<Button
					type="submit"
					size="lg"
					className="mt-2 h-11 w-full"
					disabled={code.length !== 6}
					isLoading={confirmRegistration.isPending}
				>
					Verify & create account
				</Button>
			</form>

			<div className="flex items-center justify-between gap-4 text-[13px] text-subtle">
				<button
					type="button"
					className="inline-flex items-center gap-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground"
					onClick={onBack}
				>
					<ArrowLeft className="size-3.5" />
					Use a different email
				</button>
				<span>Code expires in 15 minutes</span>
			</div>
		</AuthStep>
	);
};

export { VerifyEmailStep };
