import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { VaultMark } from "@/components/shared/VaultMark";
import { Button } from "@/components/ui";

const HeaderActions: React.FC<{
	isLoading: boolean;
	isAuthenticated: boolean;
}> = ({ isLoading, isAuthenticated }) => {
	if (isLoading) {
		return <span className="h-8 w-28 animate-pulse rounded-lg bg-accent" />;
	}

	if (isAuthenticated) {
		return (
			<Button asChild size="sm">
				<Link to="/vault">Open your vault</Link>
			</Button>
		);
	}

	return (
		<>
			<Link
				to="/login"
				className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				Sign in
			</Link>
			<Button asChild size="sm">
				<Link to="/register">Create a vault</Link>
			</Button>
		</>
	);
};

const LandingHeader: React.FC<{
	isLoading: boolean;
	isAuthenticated: boolean;
}> = ({ isLoading, isAuthenticated }) => {
	const { resolvedTheme, setTheme } = useTheme();

	const isDark = resolvedTheme === "dark";

	const handleThemeToggle = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
			<Link
				to="/"
				className="flex items-center gap-2.5 rounded-md font-semibold tracking-tight"
			>
				<VaultMark size="sm" />
				SecureVault
			</Link>

			<div className="flex items-center gap-2 sm:gap-3">
				<button
					type="button"
					aria-label={
						isDark ? "Switch to light mode" : "Switch to dark mode"
					}
					onClick={handleThemeToggle}
					className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
				>
					{isDark ? (
						<Sun className="size-4" />
					) : (
						<Moon className="size-4" />
					)}
				</button>

				<HeaderActions
					isLoading={isLoading}
					isAuthenticated={isAuthenticated}
				/>
			</div>
		</header>
	);
};

export { LandingHeader };
