import { Link } from "@tanstack/react-router";
import {
	ArrowDownUp,
	KeyRound,
	SlidersHorizontal,
	User,
	UserCog,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ to: "/vault/settings", label: "General", icon: SlidersHorizontal },
	{ to: "/vault/settings/profile", label: "Profile", icon: User },
	{ to: "/vault/settings/security", label: "Security", icon: KeyRound },
	{ to: "/vault/settings/data", label: "Import & export", icon: ArrowDownUp },
	{ to: "/vault/settings/account", label: "Account", icon: UserCog },
] as const;

const SettingsNav: React.FC = () => {
	return (
		<nav aria-label="Settings" className="md:w-48 md:shrink-0">
			<p className="mb-3 px-3 text-xs font-medium text-subtle max-md:hidden">
				Settings
			</p>
			<ul className="-mx-1 flex [scrollbar-width:none] gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0">
				{NAV_ITEMS.map(({ to, label, icon: Icon }) => (
					<li key={to} className="shrink-0">
						<Link
							to={to}
							activeOptions={{ exact: true }}
							className="group relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
						>
							{({ isActive }) => (
								<>
									{isActive && (
										<motion.span
											layoutId="settings-nav-indicator"
											transition={{
												type: "spring",
												stiffness: 520,
												damping: 40,
											}}
											className="absolute inset-0 rounded-lg bg-accent"
										/>
									)}
									<Icon
										className={cn(
											"relative size-4 transition-colors",
											isActive
												? "text-foreground"
												: "text-subtle group-hover:text-muted-foreground",
										)}
									/>
									<span
										className={cn(
											"relative transition-colors",
											isActive
												? "font-medium text-foreground"
												: "text-muted-foreground group-hover:text-foreground",
										)}
									>
										{label}
									</span>
								</>
							)}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
};

export { SettingsNav };
