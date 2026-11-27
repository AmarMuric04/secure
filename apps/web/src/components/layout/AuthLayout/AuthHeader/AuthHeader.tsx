import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { VaultMark } from "@/components/shared/VaultMark";

const AuthHeader: React.FC = () => {
	const { resolvedTheme, setTheme } = useTheme();

	const isDark = resolvedTheme === "dark";

	const handleThemeToggle = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<header className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
			<Link
				to="/"
				className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
			>
				<VaultMark size="sm" />
				Sealed
			</Link>

			<button
				type="button"
				aria-label={
					isDark ? "Switch to light mode" : "Switch to dark mode"
				}
				onClick={handleThemeToggle}
				className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
			>
				{isDark ? (
					<Sun className="size-4" />
				) : (
					<Moon className="size-4" />
				)}
			</button>
		</header>
	);
};

export { AuthHeader };
