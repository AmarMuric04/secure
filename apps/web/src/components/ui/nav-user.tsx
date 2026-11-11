import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./sidebar";

export interface NavUserProps {
	/** User display name */
	name: string;
	/** User email or secondary text */
	email?: string;
	/** User avatar URL */
	avatar?: string;
	/** Fallback initials to show when no avatar */
	initials?: string;
	/** Whether to show the dropdown indicator */
	showDropdownIndicator?: boolean;
	/** Custom dropdown content */
	dropdownContent?: React.ReactNode;
	/** Additional class name for the menu button */
	className?: string;
	/** Click handler when no dropdown is provided */
	onClick?: () => void;
	/** Render prop for custom avatar */
	renderAvatar?: (props: {
		name: string;
		initials: string;
	}) => React.ReactNode;
}

/**
 * Utility function to get initials from a name or email
 */
export function getInitials(name: string, email?: string): string {
	if (name && name !== email) {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
	return email?.charAt(0).toUpperCase() || "U";
}

/**
 * A reusable navigation user component for sidebar footers.
 * Displays user information with optional dropdown menu support.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <NavUser name="John Doe" email="john@example.com" />
 *
 * // With dropdown
 * <NavUser
 *   name="John Doe"
 *   email="john@example.com"
 *   showDropdownIndicator
 *   dropdownContent={
 *     <DropdownMenuContent>
 *       <DropdownMenuItem>Profile</DropdownMenuItem>
 *       <DropdownMenuItem>Settings</DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem>Log out</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   }
 * />
 * ```
 */
export function NavUser({
	name,
	email,
	avatar,
	initials,
	showDropdownIndicator = false,
	dropdownContent,
	className,
	onClick,
	renderAvatar,
}: NavUserProps) {
	const displayInitials = initials || getInitials(name, email);

	const avatarElement = renderAvatar ? (
		renderAvatar({ name, initials: displayInitials })
	) : avatar ? (
		<img
			src={avatar}
			alt={name}
			className="h-8 w-8 rounded-lg object-cover"
		/>
	) : (
		<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
			<span className="text-sm font-medium">{displayInitials}</span>
		</div>
	);

	const buttonContent = (
		<>
			{avatarElement}
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{name}</span>
				{email && (
					<span className="truncate text-xs text-muted-foreground">
						{email}
					</span>
				)}
			</div>
			{showDropdownIndicator && (
				<ChevronsUpDown className="ml-auto size-4" />
			)}
		</>
	);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className={cn(
						"data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
						!onClick && !dropdownContent && "cursor-default",
						className,
					)}
					onClick={onClick}
				>
					{buttonContent}
				</SidebarMenuButton>
				{dropdownContent}
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

export interface SimpleNavUserProps {
	/** User display name */
	name: string;
	/** Secondary text (e.g., plan, role) */
	subtitle?: string;
	/** User avatar URL */
	avatar?: string;
	/** Fallback initials to show when no avatar */
	initials?: string;
	/** Additional class name */
	className?: string;
}

/**
 * A simple, non-interactive user display for sidebar footers.
 * Use this when you don't need dropdown functionality.
 */
export function SimpleNavUser({
	name,
	subtitle,
	avatar,
	initials,
	className,
}: SimpleNavUserProps) {
	const displayInitials = initials || getInitials(name);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className={cn("cursor-default", className)}
				>
					{avatar ? (
						<img
							src={avatar}
							alt={name}
							className="h-8 w-8 rounded-xl object-cover"
						/>
					) : (
						<div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
							<span className="text-sm font-medium">
								{displayInitials}
							</span>
						</div>
					)}
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">{name}</span>
						{subtitle && (
							<span className="truncate text-xs text-muted-foreground">
								{subtitle}
							</span>
						)}
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
