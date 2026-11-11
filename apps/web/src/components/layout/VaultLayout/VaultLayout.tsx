import {
	Navigate,
	Outlet,
	useLocation,
	useMatches,
} from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { motion } from "motion/react";
import { useState } from "react";

import { VaultMark } from "@/components/shared/VaultMark";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui";
import { EASE_OUT } from "@/lib/motion";
import { useAutoLock } from "@/lib/useAutoLock";
import { cn } from "@/lib/utils";

import { AppSidebar } from "./AppSidebar";
import { UnlockScreen } from "./UnlockScreen";
import { VaultSplash } from "./VaultSplash";

const SPLIT_VIEW_ROUTE_ID = "/vault/";
const UnlockedVault: React.FC<{ autoLockMinutes: number }> = ({
	autoLockMinutes,
}) => {
	const { lock } = secure.vault.useVaultLock();
	const matches = useMatches();
	const { pathname } = useLocation();

	const lockAtRef = useAutoLock({ minutes: autoLockMinutes, onLock: lock });

	const isSplitView = matches.some(
		(match) => match.routeId === SPLIT_VIEW_ROUTE_ID,
	);

	return (
		<SidebarProvider>
			<AppSidebar lockAtRef={lockAtRef} />
			<SidebarInset className="h-svh min-h-0 overflow-hidden bg-card md:h-[calc(100svh-1rem)] md:peer-data-[variant=inset]:shadow-panel">
				<header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 md:hidden">
					<SidebarTrigger className="size-9" />
					<VaultMark size="sm" />
					<span className="font-semibold">SecureVault</span>
				</header>

				<motion.div
					key={pathname}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, ease: EASE_OUT }}
					className={cn(
						"flex min-h-0 flex-1 flex-col",
						!isSplitView && "overflow-y-auto p-4 sm:p-6",
					)}
				>
					{isSplitView ? (
						<Outlet />
					) : (
						<div className="mx-auto w-full max-w-5xl">
							<Outlet />
						</div>
					)}
				</motion.div>
			</SidebarInset>
		</SidebarProvider>
	);
};

const VaultLayout: React.FC = () => {
	const { data: user, isPending } = secure.auth.useSession();
	const { isUnlocked } = secure.vault.useVaultLock();

	const [isLockScreenDismissed, setIsLockScreenDismissed] =
		useState(isUnlocked);

	if (!isUnlocked && isLockScreenDismissed) {
		setIsLockScreenDismissed(false);
	}

	if (isPending) {
		return <VaultSplash message="Checking your session..." />;
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	return (
		<>
			{isUnlocked && (
				<UnlockedVault
					autoLockMinutes={user.settings.autoLockMinutes}
				/>
			)}

			{!isLockScreenDismissed && (
				<UnlockScreen
					email={user.email}
					isUnlocked={isUnlocked}
					onDismiss={() => setIsLockScreenDismissed(true)}
				/>
			)}
		</>
	);
};

export { VaultLayout };
