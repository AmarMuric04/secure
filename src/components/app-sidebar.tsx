"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Shield,
  Key,
  Star,
  Folder,
  Trash2,
  Settings,
  Plus,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { usePrefetchPasswords, usePrefetchCategories } from "@/hooks";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/Button";

const vaultNavigation = [
  { name: "All Passwords", href: "/vault", icon: Key },
  { name: "Favorites", href: "/vault/favorites", icon: Star },
  { name: "Categories", href: "/vault/categories", icon: Folder },
];

const securityNavigation = [
  { name: "Security", href: "/vault/security", icon: ShieldAlert },
  { name: "Analytics", href: "/vault/analytics", icon: BarChart3 },
];

const organizationNavigation = [
  { name: "Trash", href: "/vault/trash", icon: Trash2 },
];

const settingsNavigation = [
  { name: "Settings", href: "/vault/settings", icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { prefetch } = usePrefetchPasswords();
  const { prefetch: prefetchCategories } = usePrefetchCategories();

  const user = session?.user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/vault">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SecureVault</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Password Manager
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Add Password Button */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <Button asChild className="w-full rounded-xl">
              <Link href="/vault/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Password
              </Link>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Vault Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Vault
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {vaultNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/vault" && pathname === "/vault");
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      onMouseEnter={() => {
                        if (item.href === "/vault/categories") {
                          prefetchCategories();
                          prefetch();
                        } else if (item.href === "/vault/favorites") {
                          prefetch({ favorite: true });
                        } else {
                          prefetch();
                        }
                      }}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Security & Insights Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Security & Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {securityNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      onMouseEnter={() => {
                        prefetch();
                      }}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Organization
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organizationNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      onMouseEnter={() => {
                        if (item.href === "/vault/trash") {
                          prefetch({ includeDeleted: true });
                        }
                      }}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || user?.email || "User",
            email: user?.email || "",
            avatar: user?.image || "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
