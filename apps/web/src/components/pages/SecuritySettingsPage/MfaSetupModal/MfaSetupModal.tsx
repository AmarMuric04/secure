import { secure } from "business-logic-secure";
import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { CodeInput } from "@/components/shared/CodeInput";
import { FormError } from "@/components/shared/FormError";
import { Button, Modal, Spinner } from "@/components/ui";
import { useCopySecret } from "@/lib/useCopySecret";

const MfaSetupForm: React.FC<{
	onCancel: () => void;
	onEnabled: (backupCodes: string[]) => void;
}> = ({ onCancel, onEnabled }) => {
	const mfaSetup = secure.user.useMfaSetup({ enabled: true });
	const enableMfa = secure.user.useEnableMfa();
	const copySecret = useCopySecret();

	const [code, setCode] = useState("");

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (!mfaSetup.data) {
			return;
		}

		enableMfa.mutate(
			{ secret: mfaSetup.data.secret, code },
			{
				onSuccess: ({ backupCodes }) => onEnabled(backupCodes),
				onError: () => setCode(""),
			},
		);
	};

	if (mfaSetup.isPending) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (mfaSetup.isError) {
		return (
			<div className="space-y-4">
				<FormError message={mfaSetup.error.message} />
				<div className="flex justify-end gap-2">
					<Button type="button" variant="ghost" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="button" onClick={() => mfaSetup.refetch()}>
						Try again
					</Button>
				</div>
			</div>
		);
	}

	const { secret, otpauthUrl } = mfaSetup.data;

	return (
		<form className="space-y-5" onSubmit={handleSubmit}>
			<div className="flex flex-col items-center gap-4 rounded-xl bg-muted p-5 ring-1 ring-border">
				<div className="rounded-lg bg-white p-3 ring-1 ring-border">
					<QRCodeSVG value={otpauthUrl} size={168} level="M" />
				</div>
				<p className="text-center text-[13px] text-muted-foreground">
					Scan with Google Authenticator, Authy or a similar app
				</p>
			</div>

			<div>
				<p className="mb-1.5 text-[13px] text-muted-foreground">
					Cannot scan? Enter this key instead
				</p>
				<div className="flex items-center gap-1 rounded-lg bg-card py-1 pr-1 pl-3 ring-1 ring-input ring-inset">
					<code className="min-w-0 flex-1 font-mono text-[13px] tracking-wide break-all">
						{secret}
					</code>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="Copy secret"
						onClick={() =>
							copySecret({ value: secret, label: "Secret" })
						}
					>
						<Copy />
					</Button>
				</div>
			</div>

			<FormError message={enableMfa.error?.message} />

			<div className="space-y-2">
				<p className="text-sm font-medium text-foreground">
					Then enter the 6-digit code it shows
				</p>
				<CodeInput
					value={code}
					isDisabled={enableMfa.isPending}
					onChange={setCode}
				/>
			</div>

			<div className="flex justify-end gap-2 pt-1">
				<Button
					type="button"
					variant="ghost"
					disabled={enableMfa.isPending}
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={code.length !== 6}
					isLoading={enableMfa.isPending}
				>
					Verify and turn on
				</Button>
			</div>
		</form>
	);
};

const MfaSetupModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	onEnabled: (backupCodes: string[]) => void;
}> = ({ isOpen, onClose, onEnabled }) => {
	return (
		<Modal
			isOpen={isOpen}
			title="Set up two-factor authentication"
			description="Add a code from your phone to every sign-in"
			onClose={onClose}
		>
			<MfaSetupForm onCancel={onClose} onEnabled={onEnabled} />
		</Modal>
	);
};

export { MfaSetupModal };
