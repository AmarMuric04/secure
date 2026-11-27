import { Navigate, Outlet } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import { MotionConfig } from "motion/react";

import { VaultMark } from "@/components/shared/VaultMark";
import { Spinner } from "@/components/ui";

import { AuthHeader } from "./AuthHeader";
import { AuthNotes } from "./AuthNotes";

const AuthLayout: React.FC = () => {
	const { data: user, isPending } = secure.auth.useSession();

	if (user) {
		return <Navigate to="/vault" />;
	}

	return (
		<MotionConfig reducedMotion="user">
			<div className="flex min-h-svh flex-col overflow-x-clip bg-background">
				<AuthHeader />

				<main className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-16 px-5 pt-10 pb-20 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:pt-20 xl:gap-20">
					<div className="w-full max-w-sm">
						{isPending ? (
							<div className="flex justify-center py-16">
								<Spinner />
							</div>
						) : (
							<Outlet />
						)}
					</div>

					<AuthNotes />
				</main>

				<footer className="mx-auto w-full max-w-6xl px-5 sm:px-8">
					<div className="flex flex-col gap-3 border-t border-foreground/15 py-8 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
						<span className="flex items-center gap-2.5 font-medium text-foreground">
							<VaultMark size="sm" />
							Sealed
						</span>
						<span>
							Encrypted in your browser, stored as ciphertext.
						</span>
					</div>
				</footer>
			</div>
		</MotionConfig>
	);
};

export { AuthLayout };
