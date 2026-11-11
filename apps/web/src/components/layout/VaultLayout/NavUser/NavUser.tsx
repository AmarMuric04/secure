import { Link } from "@tanstack/react-router";
import { secure } from "business-logic-secure";
import {
	ChevronsUpDown,
	LogOut,
	Moon,
	Settings,
	Shield,
	Sun,
	User,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui";

const toInitials = ({
	name,
	email,
}: {
	name: string | null;
	email: string;
}) => {
	if (!name) {
		return email.charAt(0).toUpperCase();
	}

	return name
		.split(" ")
		.map((word) => word.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

const UserSummary: React.FC<{
	name: string | null;
	email: string;
	avatarUrl: string | null;
}> = ({ name, email, avatarUrl }) => {
	return (
		<>
			<Avatar className="size-7 rounded-lg">
				<AvatarImage src={avatarUrl ?? undefined} alt={name ?? email} />
				<AvatarFallback className="rounded-lg bg-accent text-xs font-semibold text-muted-foreground">
					{toInitials({ name, email })}
				</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{name ?? email}</span>
				<span className="truncate text-xs text-muted-foreground">
					{email}
				</span>
			</div>
		</>
	);
};

const NavUser: React.FC = () => {
	const { isMobile } = useSidebar();
	const { data: user } = secure.auth.useSession();
	const logout = secure.auth.useLogout();
	const { resolvedTheme, setTheme } = useTheme();

	const isDark = resolvedTheme === "dark";

	if (!user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="h-11 flex-1 rounded-lg group-data-[collapsible=icon]:flex-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>span:first-child]:shrink-0"
						>
							<UserSummary
								name={user.name}
								email={user.email}
								avatarUrl={user.avatarUrl}
							/>
							<ChevronsUpDown className="ml-auto size-4 text-subtle" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<UserSummary
									name={user.name}
									email={user.email}
									avatarUrl={user.avatarUrl}
								/>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link to="/vault/settings/profile">
									<User />
									Profile
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/vault/settings">
									<Settings />
									Settings
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/vault/settings/security">
									<Shield />
									Security
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => logout.mutate()}
						>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label={isDark ? "Use light theme" : "Use dark theme"}
					className="shrink-0 rounded-lg text-muted-foreground group-data-[collapsible=icon]:hidden"
					onClick={() => setTheme(isDark ? "light" : "dark")}
				>
					{isDark ? <Sun /> : <Moon />}
				</Button>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};

export { NavUser };
