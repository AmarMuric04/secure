"use client";

import { cn } from "@/lib/utils";

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
        "w-full mx-auto",
        // Mobile: full width with padding
        "px-4",
        // Tablet: constrained width
        "sm:px-6 sm:max-w-2xl",
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
