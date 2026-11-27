import { Link } from "@tanstack/react-router";

import { VaultMark } from "@/components/shared/VaultMark";
import { Button } from "@/components/ui";

const ClosingNote: React.FC<{ isAuthenticated: boolean }> = ({
	isAuthenticated,
}) => {
	if (isAuthenticated) {
		return <>Everything in it is still sealed until you unlock it.</>;
	}

	return (
		<>
			Add the rest when you’re ready, or import them from the manager you
			use today. Already have a vault?{" "}
			<Link
				to="/login"
				className="text-band-foreground underline decoration-band-foreground/40 underline-offset-4 transition-colors hover:decoration-band-foreground"
			>
				Sign in
			</Link>
			.
		</>
	);
};

const LandingClosing: React.FC<{ isAuthenticated: boolean }> = ({
	isAuthenticated,
}) => {
	return (
		<footer className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 lg:pt-40">
			<div className="flex flex-col gap-8 rounded-[1.75rem] bg-band px-7 py-12 text-band-foreground sm:px-12 sm:py-16 lg:flex-row lg:items-end lg:justify-between">
				<div className="max-w-xl">
					<p className="text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-5xl">
						{isAuthenticated
							? "Your vault is waiting."
							: "Start with one password."}
					</p>
					<p className="mt-4 text-pretty text-band-muted">
						<ClosingNote isAuthenticated={isAuthenticated} />
					</p>
				</div>

				<Button
					asChild
					size="xl"
					className="w-fit shrink-0 bg-band-foreground text-band hover:bg-band-foreground/90"
				>
					<Link to={isAuthenticated ? "/vault" : "/register"}>
						{isAuthenticated
							? "Open your vault"
							: "Create your vault"}
					</Link>
				</Button>
			</div>

			<div className="flex flex-col gap-3 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
				<span className="flex items-center gap-2.5 font-medium text-foreground">
					<VaultMark size="sm" />
					Sealed
				</span>
				<span>Encrypted in your browser, stored as ciphertext.</span>
			</div>
		</footer>
	);
};

export { LandingClosing };
