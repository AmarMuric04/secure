import { secure } from "business-logic-secure";
import { useState } from "react";

import { VaultMark } from "@/components/shared/VaultMark";
import { cn } from "@/lib/utils";

import { VaultSplash } from "../VaultSplash";
import { UnlockForm } from "./UnlockForm";

const FADE_DELAY = 450;
const DISMISS_DELAY = 950;

const UnlockScreen: React.FC<{
	email: string;
	isUnlocked: boolean;
	onDismiss: () => void;
}> = ({ email, isUnlocked, onDismiss }) => {
	const { data: vaultKeys, isPending, error } = secure.vault.useVaultKeys();
	const logout = secure.auth.useLogout();

	const [isFading, setIsFading] = useState(false);

	const handleOpened = () => {
		window.setTimeout(() => setIsFading(true), FADE_DELAY);
		window.setTimeout(onDismiss, DISMISS_DELAY);
	};

	if (isPending) {
		return <VaultSplash message="Fetching your encrypted keys" />;
	}

	return (
		<div
			className={cn(
				"fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-background px-5 py-24 transition-opacity duration-500 ease-out",
				isFading && "pointer-events-none opacity-0",
			)}
		>
			<div className="absolute top-5 left-5 flex items-center gap-2.5 text-[15px] font-semibold tracking-tight sm:left-8">
				<VaultMark size="sm" />
				Sealed
			</div>

			<div className="relative flex w-full max-w-100 flex-col items-center text-center motion-safe:animate-[rise-in_0.45s_var(--ease-out-quint)]">
				<UnlockForm
					isSetup={vaultKeys?.salt === null}
					isUnlocked={isUnlocked}
					email={email}
					loadError={error?.message ?? null}
					onOpened={handleOpened}
				/>

				<button
					type="button"
					className="mt-3 text-sm text-muted-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
					onClick={() => logout.mutate()}
				>
					Sign out
				</button>
			</div>

			<p className="pointer-events-none absolute inset-x-0 bottom-6 px-5 text-center text-sm text-subtle">
				Your master password never leaves this device.
			</p>
		</div>
	);
};

export { UnlockScreen };
