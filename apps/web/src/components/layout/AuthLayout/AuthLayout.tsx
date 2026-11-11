import { Link, Navigate, Outlet } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { Lock } from "lucide-react";

import { VaultMark } from "@/components/shared/VaultMark";
import { Spinner } from "@/components/ui";

import { AuthShowcase } from "./AuthShowcase";

const AuthLayout: React.FC = () => {
	const { data: user, isPending } = secure.auth.useSession();

	if (user) {
		return <Navigate to="/vault" />;
	}

	return (
		<div className="grid min-h-svh bg-background lg:h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
			<div className="flex min-h-svh flex-col px-6 sm:px-12 lg:min-h-0 lg:overflow-y-auto">
				<header className="flex h-20 shrink-0 items-center">
					<Link
						to="/"
						className="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight"
					>
						<VaultMark size="sm" />
						SecureVault
					</Link>
				</header>

				<main className="flex flex-1 items-center justify-center py-10">
					<div className="w-full max-w-[380px]">
						{isPending ? (
							<div className="flex justify-center py-16">
								<Spinner />
							</div>
						) : (
							<Outlet />
						)}
					</div>
				</main>

				<footer className="flex h-16 shrink-0 items-center gap-1.5 text-xs text-subtle">
					<Lock className="size-3" />
					Your master password never leaves this device.
				</footer>
			</div>

			<AuthShowcase />
		</div>
	);
};

export { AuthLayout };
