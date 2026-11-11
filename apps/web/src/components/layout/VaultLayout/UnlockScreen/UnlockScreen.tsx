import { secure } from "business-logic-secure";
import { Lock } from "lucide-react";
import { useRef, useState } from "react";

import { VaultMark } from "@/components/shared/VaultMark";
import { cn } from "@/lib/utils";

import { VaultSplash } from "../VaultSplash";
import { CipherField } from "./CipherField";
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
	const cipherRef = useRef<{
		burst: (point: { x: number; y: number }) => void;
	}>(null);

	const handleOpened = (point: { x: number; y: number }) => {
		cipherRef.current?.burst(point);
		window.setTimeout(() => setIsFading(true), FADE_DELAY);
		window.setTimeout(onDismiss, DISMISS_DELAY);
	};

	if (isPending) {
		return <VaultSplash message="Loading vault..." />;
	}

	return (
		<div
			className={cn(
				"fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-background/85 px-4 py-20 backdrop-blur-2xl backdrop-saturate-125 transition-opacity duration-500 ease-out",
				isFading && "pointer-events-none opacity-0",
			)}
		>
			<CipherField ref={cipherRef} />

			<div
				data-cipher-ignore
				className="absolute top-5 left-4 flex items-center gap-2.5 font-semibold tracking-tight sm:left-6"
			>
				<VaultMark size="sm" />
				SecureVault
			</div>

			<div
				data-cipher-ignore
				className="relative flex w-full max-w-100 flex-col items-center text-center motion-safe:animate-[rise-in_0.45s_var(--ease-out-quint)]"
			>
				<UnlockForm
					isSetup={vaultKeys?.salt === null}
					isUnlocked={isUnlocked}
					email={email}
					loadError={error?.message ?? null}
					onOpened={handleOpened}
				/>

				<button
					type="button"
					className="mt-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
					onClick={() => logout.mutate()}
				>
					Sign out
				</button>
			</div>

			<p className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 px-4 text-center text-xs text-subtle">
				<Lock className="size-3.5 shrink-0" />
				End-to-end encrypted. Your master password never leaves this
				device.
			</p>
		</div>
	);
};

export { UnlockScreen };
