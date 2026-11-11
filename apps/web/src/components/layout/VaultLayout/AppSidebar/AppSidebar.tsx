import { Link, useLocation } from "@tanstack/react-router";
import {
	buildSecurityReport,
	listFavoriteEntries,
	secure,
} from "business-logic-secure";
import { BarChart3, LayoutGrid, ShieldAlert, Star, Trash2 } from "lucide-react";

import { VaultMark } from "@/components/shared/VaultMark";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarRail,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui";

import { NavUser } from "../NavUser";
import { AutoLockCard } from "./AutoLockCard";
import { CategoryNavGroup } from "./CategoryNavGroup";
import { SidebarNavItem } from "./SidebarNavItem";

const AppSidebar: React.FC<{ lockAtRef: React.RefObject<number> }> = ({
	lockAtRef,
}) => {
	const { pathname, search } = useLocation();
	const { state } = useSidebar();
	const vault = secure.vault.useVault({ includeDeleted: false });
	const audit = secure.vault.useVaultAudit();

	const passwords = vault.data?.passwords ?? [];
	const isVaultRoute = pathname === "/vault" || pathname === "/vault/";
	const isFavorites = isVaultRoute && search.filter === "favorites";
	const activeCategoryId = isVaultRoute ? (search.category ?? null) : null;
	const toggleLabel =
		state === "expanded" ? "Collapse sidebar" : "Expand sidebar";

	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader className="flex-row items-center gap-1 px-3 pt-3 pb-4 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-2">
				<Link
					to="/vault"
					aria-label="SecureVault"
					className="flex min-w-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight"
				>
					<VaultMark size="sm" />
					<span className="truncate group-data-[collapsible=icon]:hidden">
						SecureVault
					</span>
				</Link>
				<SidebarTrigger
					aria-label={toggleLabel}
					title={`${toggleLabel} (Ctrl+B)`}
					className="ml-auto size-7 rounded-md text-subtle group-data-[collapsible=icon]:mt-2 group-data-[collapsible=icon]:ml-0 hover:text-foreground"
				/>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarNavItem
								label="All items"
								isActive={
									isVaultRoute &&
									!isFavorites &&
									!activeCategoryId
								}
								count={passwords.length}
							>
								<Link to="/vault">
									<LayoutGrid />
									<span>All items</span>
								</Link>
							</SidebarNavItem>
							<SidebarNavItem
								label="Favorites"
								isActive={isFavorites}
								count={listFavoriteEntries(passwords).length}
							>
								<Link
									to="/vault"
									search={{ filter: "favorites" }}
								>
									<Star />
									<span>Favorites</span>
								</Link>
							</SidebarNavItem>
							<SidebarNavItem
								label="Needs attention"
								isActive={pathname === "/vault/security"}
								count={
									audit.data
										? buildSecurityReport({
												passwords,
												audit: audit.data,
											}).issueCount
										: 0
								}
								isWarning
							>
								<Link to="/vault/security">
									<ShieldAlert />
									<span>Needs attention</span>
								</Link>
							</SidebarNavItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{vault.data && vault.data.categories.length > 0 && (
					<CategoryNavGroup
						vault={vault.data}
						activeCategoryId={activeCategoryId}
					/>
				)}

				<SidebarGroup>
					<SidebarGroupLabel className="text-subtle">
						More
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarNavItem
								label="Analytics"
								isActive={pathname === "/vault/analytics"}
							>
								<Link to="/vault/analytics">
									<BarChart3 />
									<span>Analytics</span>
								</Link>
							</SidebarNavItem>
							<SidebarNavItem
								label="Trash"
								isActive={pathname === "/vault/trash"}
							>
								<Link to="/vault/trash">
									<Trash2 />
									<span>Trash</span>
								</Link>
							</SidebarNavItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="gap-1.5">
				<AutoLockCard lockAtRef={lockAtRef} />
				<NavUser />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
};

export { AppSidebar };
