# Card Component Migration Guide

## Quick Start

Import the new card components from `@/components/ui`:

```tsx
import { Card, LongCard, MetricCard, ChartCard } from "@/components/ui";
```

## Component Replacements

### 1. Replace Manual Cards with MetricCard

**Before:**
```tsx
<div className="rounded-3xl border p-6 bg-card shadow-sm">
  <div className="flex items-center justify-between">
    <div className="text-primary">
      <Shield className="h-5 w-5" />
    </div>
  </div>
  <h3 className="font-semibold mt-4">Security Score</h3>
  <div className="text-3xl font-bold mt-2">85%</div>
  <p className="text-sm text-muted-foreground mt-1">Excellent</p>
</div>
```

**After:**
```tsx
<MetricCard
  icon={<Shield className="h-5 w-5" />}
  title="Security Score"
  value="85%"
  description="Excellent"
/>
```

### 2. Replace List Cards with LongCard

**Before:**
```tsx
<div className="flex items-center gap-4 p-5 bg-card rounded-3xl border hover:bg-accent/30 transition-all shadow-sm">
  {/* Avatar */}
  <div className="h-12 w-12 rounded-2xl bg-primary/10">
    <span>A</span>
  </div>
  {/* Content */}
  <div className="flex-1">...</div>
  {/* Actions */}
  <Button>View</Button>
</div>
```

**After:**
```tsx
<LongCard hoverable>
  {/* Avatar */}
  <div className="h-12 w-12 rounded-2xl bg-primary/10">
    <span>A</span>
  </div>
  {/* Content */}
  <div className="flex-1">...</div>
  {/* Actions */}
  <Button>View</Button>
</LongCard>
```

### 3. Selection State with LongCard

**Before:**
```tsx
<div
  className={`flex items-center gap-4 p-5 bg-card rounded-3xl border shadow-sm ${
    isSelected ? "border-primary bg-primary/5" : "hover:bg-accent/30"
  }`}
>
  {/* Content */}
</div>
```

**After:**
```tsx
<LongCard
  variant={isSelected ? "selected" : "default"}
  hoverable={!isSelected}
>
  {/* Content */}
</LongCard>
```

### 4. Replace Chart Containers with ChartCard

**Before:**
```tsx
<div className="rounded-3xl border bg-card p-6 shadow-sm">
  <div className="mb-6">
    <h3 className="text-lg font-semibold">Password Strength</h3>
    <p className="text-sm text-muted-foreground mt-1">Distribution</p>
  </div>
  <ResponsiveContainer>
    <PieChart>{/* ... */}</PieChart>
  </ResponsiveContainer>
</div>
```

**After:**
```tsx
<ChartCard title="Password Strength" description="Distribution">
  <ResponsiveContainer>
    <PieChart>{/* ... */}</PieChart>
  </ResponsiveContainer>
</ChartCard>
```

## Props Reference

### MetricCard Props
```typescript
interface MetricCardProps {
  icon?: React.ReactNode;        // Icon to display at top
  title: string;                 // Card title
  value: string | number;        // Main metric value (large text)
  description?: string;          // Optional description below value
  action?: React.ReactNode;      // Optional action button/link at bottom
}
```

### LongCard Props
```typescript
interface LongCardProps {
  variant?: "default" | "hover" | "selected";  // Visual style
  hoverable?: boolean;                          // Enable/disable hover effect (default: true)
  className?: string;                           // Additional CSS classes
  children: React.ReactNode;                    // Card content
}
```

### ChartCard Props
```typescript
interface ChartCardProps {
  title: string;                 // Chart title
  description?: string;          // Optional description
  children: React.ReactNode;     // Chart component
  className?: string;            // Additional CSS classes
}
```

## Common Patterns

### Adding Actions to MetricCard

```tsx
<MetricCard
  icon={<Shield className="h-5 w-5" />}
  title="Security Score"
  value="85%"
  description="Excellent"
  action={
    <Button variant="outline" size="sm" className="w-full rounded-2xl" asChild>
      <Link href="/vault/security">
        View Details
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </Button>
  }
/>
```

### Using LongCard with Checkboxes

```tsx
<LongCard
  variant={isSelected ? "selected" : "default"}
  hoverable={!isSelected}
>
  <Checkbox checked={isSelected} onChange={toggleSelection} />
  {/* Rest of content */}
</LongCard>
```

### Responsive LongCard Content

```tsx
<LongCard hoverable>
  {/* Avatar - always visible */}
  <div className="h-12 w-12 rounded-2xl bg-primary/10">A</div>
  
  {/* Main content - always visible */}
  <div className="flex-1 min-w-0">
    <h3 className="font-semibold truncate">Title</h3>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
  
  {/* URL - hidden on small screens */}
  <div className="hidden md:flex text-sm text-muted-foreground">
    example.com
  </div>
  
  {/* Timestamp - hidden on medium screens */}
  <div className="hidden lg:flex text-sm text-muted-foreground">
    2 days ago
  </div>
  
  {/* Actions - always visible */}
  <Button size="sm">View</Button>
</LongCard>
```

## Best Practices

1. **Use MetricCard for stats**: Numbers, percentages, counts
2. **Use LongCard for lists**: Passwords, users, items with actions
3. **Use ChartCard for visualizations**: Wrap all chart components
4. **Use base Card for custom layouts**: When you need more flexibility

## Examples in the Codebase

- **Analytics Page**: MetricCard and ChartCard examples
- **Security Page**: MetricCard and LongCard with badges
- **Trash Page**: LongCard with selection state and custom overlays
- **All Passwords**: LongCard with hover effects and responsive columns
