import * as React from "react";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./sidebar";
import { Separator } from "./separator";

interface DashboardWrapperProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * Wrapper component for dashboard pages that provides consistent
 * responsive width constraints across all viewport sizes.
 */
export function DashboardWrapper({
	children,
	className,
}: DashboardWrapperProps) {
	return (
		<div
			className={cn(
				"mx-auto w-full",
				// Mobile: full width with padding
				"px-4",
				// Tablet: constrained width
				"sm:max-w-2xl sm:px-6",
				// Desktop: wider constraint
				"md:max-w-4xl",
				// Large desktop: even wider
				"lg:max-w-5xl",
				// Extra large: max width
				"xl:max-w-6xl",
				"2xl:max-w-7xl",
				className,
			)}
		>
			{children}
		</div>
	);
}

export interface DashboardLayoutProps {
	/** The sidebar component to render */
	sidebar: React.ReactNode;
	/** The main content of the dashboard */
	children: React.ReactNode;
	/** Optional header content to the right of the sidebar trigger */
	headerContent?: React.ReactNode;
	/** Additional class name for the main content area */
	mainClassName?: string;
	/** Additional class name for the header */
	headerClassName?: string;
	/** Whether to show the header separator - defaults to true */
	showHeaderSeparator?: boolean;
	/** Default sidebar open state - defaults to true */
	defaultOpen?: boolean;
}

/**
 * A polished, reusable dashboard layout component that provides:
 * - Collapsible sidebar with mobile support
 * - Sticky header with sidebar trigger
 * - Backdrop blur effect on header
 * - Consistent spacing and styling
 * - Full height layout with scrollable content
 *
 * @example
 * ```tsx
 * <DashboardLayout
 *   sidebar={<AppSidebar />}
 *   headerContent={<Breadcrumb />}
 * >
 *   <YourPageContent />
 * </DashboardLayout>
 * ```
 */
export function DashboardLayout({
	sidebar,
	children,
	headerContent,
	mainClassName,
	headerClassName,
	showHeaderSeparator = true,
	defaultOpen = true,
}: DashboardLayoutProps) {
	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			{sidebar}
			<SidebarInset className="flex h-screen flex-col overflow-hidden">
				<header
					className={cn(
						"flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
						headerClassName,
					)}
				>
					<SidebarTrigger className="-ml-1" />
					{showHeaderSeparator && (
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
					)}
					{headerContent}
					<div className="flex-1" />
				</header>
				<main
					className={cn("flex-1 overflow-y-auto p-6", mainClassName)}
				>
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

export interface DashboardPageHeaderProps {
	/** The title of the page */
	title: string;
	/** Optional description below the title */
	description?: string;
	/** Optional action buttons/content to display on the right */
	actions?: React.ReactNode;
	/** Additional class name */
	className?: string;
}

/**
 * A consistent page header component for dashboard pages.
 * Includes title, optional description, and action area.
 */
export function DashboardPageHeader({
	title,
	description,
	actions,
	className,
}: DashboardPageHeaderProps) {
	return (
		<div
			className={cn(
				"mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
				className,
			)}
		>
			<div className="space-y-1">
				<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
				{description && (
					<p className="text-muted-foreground">{description}</p>
				)}
			</div>
			{actions && (
				<div className="mt-4 flex items-center gap-2 sm:mt-0">
					{actions}
				</div>
			)}
		</div>
	);
}

export interface DashboardContentProps {
	children: React.ReactNode;
	/** Additional class name */
	className?: string;
	/** Whether to use max-width constraints - defaults to true */
	constrained?: boolean;
}

/**
 * A content wrapper for dashboard pages that provides consistent max-width constraints.
 */
export function DashboardContent({
	children,
	className,
	constrained = true,
}: DashboardContentProps) {
	return (
		<div
			className={cn(
				"w-full",
				constrained && "mx-auto max-w-7xl",
				className,
			)}
		>
			{children}
		</div>
	);
}
