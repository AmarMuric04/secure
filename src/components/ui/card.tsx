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
      "rounded-3xl border bg-card text-card-foreground shadow-sm",
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
    className={cn("font-semibold leading-none tracking-tight", className)}
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
      hover: hoverable ? "hover:bg-accent/30 transition-all" : "",
      selected: "border-primary bg-primary/5",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 p-5 bg-card rounded-3xl border shadow-sm",
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
      className={cn("rounded-3xl border p-6 bg-card shadow-sm", className)}
      {...props}
    >
      {icon && (
        <div className="flex items-center justify-between">
          <div className="text-primary">{icon}</div>
        </div>
      )}
      <h3 className="font-semibold mt-4">{title}</h3>
      <div className="text-3xl font-bold mt-2">{value}</div>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
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
      className={cn("rounded-3xl border bg-card p-6 shadow-sm", className)}
      {...props}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  ),
);
ChartCard.displayName = "ChartCard";

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
};
