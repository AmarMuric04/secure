import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { VaultMark } from "@/components/shared/VaultMark";
import { Button } from "@/components/ui";

const SECTION_LINKS = [
	{ href: "#how-it-works", label: "How it works" },
	{ href: "#features", label: "Features" },
	{ href: "#by-design", label: "By design" },
];

const HeaderActions: React.FC<{
	isLoading: boolean;
	isAuthenticated: boolean;
}> = ({ isLoading, isAuthenticated }) => {
	if (isLoading) {
		return <span className="h-9 w-32 animate-pulse rounded-lg bg-accent" />;
	}

	if (isAuthenticated) {
		return (
			<Button asChild variant="ink">
				<Link to="/vault">Open your vault</Link>
			</Button>
		);
	}

	return (
		<>
			<Link
				to="/login"
				className="px-2 py-1 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
			>
				Sign in
			</Link>
			<Button asChild variant="ink">
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
		<header className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
			<Link
				to="/"
				className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
			>
				<VaultMark size="sm" />
				Sealed
			</Link>

			<nav
				aria-label="Sections"
				className="hidden items-center gap-8 text-sm text-muted-foreground md:flex"
			>
				{SECTION_LINKS.map((link) => (
					<a
						key={link.href}
						href={link.href}
						className="transition-colors hover:text-foreground"
					>
						{link.label}
					</a>
				))}
			</nav>

			<div className="flex items-center gap-1.5 sm:gap-3">
				<button
					type="button"
					aria-label={
						isDark ? "Switch to light mode" : "Switch to dark mode"
					}
					onClick={handleThemeToggle}
					className="hidden size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground sm:grid"
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
