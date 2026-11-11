import * as React from "react";
import { cn } from "@/lib/utils";

// Base Card Components
const Card = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"rounded-xl bg-card text-card-foreground ring-1 ring-border",
			className,
		)}
		{...props}
	/>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex flex-col space-y-1.5 p-6", className)}
		{...props}
	/>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn("leading-none font-semibold tracking-tight", className)}
		{...props}
	/>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex items-center p-6 pt-0", className)}
		{...props}
	/>
));
CardFooter.displayName = "CardFooter";

// Long Card Component (List View Style)
interface LongCardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "hover" | "selected";
	hoverable?: boolean;
}

const LongCard = React.forwardRef<HTMLDivElement, LongCardProps>(
	({ className, variant = "default", hoverable = true, ...props }, ref) => {
		const variants = {
			default: "border-border",
			hover: hoverable ? "hover:bg-muted transition-colors" : "",
			selected: "ring-primary bg-primary-soft",
		};

		return (
			<div
				ref={ref}
				className={cn(
					"flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-border",
					variants[variant],
					variants.hover,
					className,
				)}
				{...props}
			/>
		);
	},
);
LongCard.displayName = "LongCard";

// Metric Card Component (Stats Display)
interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
	icon?: React.ReactNode;
	title: string;
	value: string | number;
	description?: string;
	action?: React.ReactNode;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
	({ className, icon, title, value, description, action, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"rounded-xl bg-card p-5 ring-1 ring-border",
				className,
			)}
			{...props}
		>
			{icon && (
				<div className="flex items-center justify-between">
					<div className="text-primary">{icon}</div>
				</div>
			)}
			<h3 className="mt-4 font-semibold">{title}</h3>
			<div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
				{value}
			</div>
			{description && (
				<p className="mt-1 text-sm text-muted-foreground">
					{description}
				</p>
			)}
			{action && <div className="mt-4">{action}</div>}
		</div>
	),
);
MetricCard.displayName = "MetricCard";

// Chart Card Component
interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	description?: string;
}

const ChartCard = React.forwardRef<HTMLDivElement, ChartCardProps>(
	({ className, title, description, children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"rounded-xl bg-card p-5 ring-1 ring-border",
				className,
			)}
			{...props}
		>
			<div className="mb-6">
				<h3 className="text-lg font-semibold">{title}</h3>
				{description && (
					<p className="mt-1 text-sm text-muted-foreground">
						{description}
					</p>
				)}
			</div>
			{children}
		</div>
	),
);
ChartCard.displayName = "ChartCard";

// Stat Card Component (with icon background)
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
	label: string;
	value: string | number;
	icon?: React.ReactNode;
	iconColor?: string;
	iconBg?: string;
	suffix?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
	(
		{
			className,
			label,
			value,
			icon,
			iconColor = "text-primary",
			iconBg = "bg-primary-soft",
			suffix,
			...props
		},
		ref,
	) => (
		<div
			ref={ref}
			className={cn(
				"flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-border",
				className,
			)}
			{...props}
		>
			{icon && (
				<div
					className={cn(
						"flex size-10 items-center justify-center rounded-lg",
						iconBg,
					)}
				>
					<div className={iconColor}>{icon}</div>
				</div>
			)}
			<div>
				<p className="text-sm text-muted-foreground">{label}</p>
				<p className="text-2xl font-semibold tracking-tight tabular-nums">
					{value}
					{suffix && (
						<span className="text-sm font-normal text-muted-foreground">
							{suffix}
						</span>
					)}
				</p>
			</div>
		</div>
	),
);
StatCard.displayName = "StatCard";

// Quick Action Card Component
interface QuickActionCardProps extends React.HTMLAttributes<HTMLButtonElement> {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	iconColor?: string;
	iconBg?: string;
}

const QuickActionCard = React.forwardRef<
	HTMLButtonElement,
	QuickActionCardProps
>(
	(
		{
			className,
			title,
			description,
			icon,
			iconColor = "text-primary",
			iconBg = "bg-primary-soft",
			...props
		},
		ref,
	) => (
		<button
			ref={ref}
			className={cn(
				"group cursor-pointer rounded-xl bg-card p-4 text-left ring-1 ring-border transition-colors hover:bg-muted",
				className,
			)}
			{...props}
		>
			<div className="flex items-center gap-4">
				{icon && (
					<div
						className={cn(
							"flex h-12 w-12 items-center justify-center rounded-lg",
							iconBg,
						)}
					>
						<div className={iconColor}>{icon}</div>
					</div>
				)}
				<div>
					<h3 className="font-semibold">{title}</h3>
					{description && (
						<p className="text-sm text-muted-foreground">
							{description}
						</p>
					)}
				</div>
			</div>
		</button>
	),
);
QuickActionCard.displayName = "QuickActionCard";

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
	LongCard,
	MetricCard,
	ChartCard,
	StatCard,
	QuickActionCard,
};
