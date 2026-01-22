# Card Components

A unified card component system based on shadcn/ui with custom variants for the password manager.

## Components

### Base Card Components
Standard shadcn card components with rounded-3xl styling:
- `Card` - Base card container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

### LongCard
Horizontal list-style card matching the All Passwords design.

**Props:**
- `variant?: "default" | "hover" | "selected"`
- `hoverable?: boolean` (default: true)

**Usage:**
```tsx
<LongCard variant="hover">
  <div className="h-12 w-12 rounded-2xl bg-primary/10">
    {/* Avatar */}
  </div>
  <div className="flex-1">
    {/* Content */}
  </div>
  <Button>Action</Button>
</LongCard>
```

### MetricCard
Stats/metrics display card.

**Props:**
- `icon?: React.ReactNode` - Icon displayed at top
- `title: string` - Card title
- `value: string | number` - Main metric value
- `description?: string` - Optional description
- `action?: React.ReactNode` - Optional action button

**Usage:**
```tsx
<MetricCard
  icon={<Shield className="h-5 w-5" />}
  title="Security Score"
  value="85%"
  description="Excellent security"
  action={<Button>View Details</Button>}
/>
```

### ChartCard
Card container for charts with title and description.

**Props:**
- `title: string` - Chart title
- `description?: string` - Optional description

**Usage:**
```tsx
<ChartCard title="Password Strength" description="Distribution of password strength">
  <ResponsiveContainer>
    {/* Chart content */}
  </ResponsiveContainer>
</ChartCard>
```

## Styling
All cards use:
- `rounded-3xl` - Consistent rounded corners
- `shadow-sm` - Subtle shadow
- `border` - Border from theme
- `bg-card` - Card background from theme
