# SecureVault Design System

A minimal, modern dark-first design system built with Tailwind CSS v4 and Radix UI.

---

## Color System

Uses **OKLCH** colors for perceptually uniform colors.

```css
/* Dark Theme (Primary) */
--background: oklch(0.145 0 0);       /* Near black */
--foreground: oklch(0.985 0 0);       /* Near white */
--card: oklch(0.205 0 0);             /* Slightly lighter than bg */
--muted: oklch(0.269 0 0);            /* Subtle backgrounds */
--muted-foreground: oklch(0.708 0 0); /* Secondary text */
--border: oklch(1 0 0 / 10%);         /* Subtle borders */
--input: oklch(1 0 0 / 15%);          /* Input backgrounds */
--primary: oklch(0.65 0.25 262);      /* Purple/Blue accent */
--destructive: oklch(0.704 0.191 22); /* Red for errors/danger */
```

---

## Border Radius

Large, soft corners for a friendly feel:

```css
--radius: 1.25rem;  /* 20px base */

/* Usage */
rounded-md    /* Small elements: checkboxes, small buttons */
rounded-xl    /* Inputs, regular buttons */
rounded-2xl   /* Cards, large buttons, containers */
rounded-3xl   /* Feature cards, hero sections */
```

---

## Typography

- **Font**: Geist Sans (--font-geist-sans)
- **Headings**: `font-bold`, larger sizes
- **Body**: `text-base` or `md:text-sm`
- **Muted text**: `text-muted-foreground`

```tsx
<h1 className="text-3xl font-bold text-foreground">Title</h1>
<p className="text-muted-foreground text-lg">Subtitle</p>
<span className="text-sm text-muted-foreground">Helper text</span>
```

---

## Spacing

Consistent spacing scale:

- `gap-2` / `space-y-2` - Tight grouping
- `gap-4` / `space-y-4` - Related items
- `gap-6` / `space-y-6` - Section padding
- `gap-8` / `space-y-8` - Major sections

---

## Components

### Buttons

```tsx
// Primary (filled)
<Button className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20">
  Action
</Button>

// Outline
<Button variant="outline" className="rounded-xl">
  Secondary
</Button>

// Ghost (minimal)
<Button variant="ghost" size="icon">
  <Icon className="h-4 w-4" />
</Button>

// Destructive
<Button variant="destructive">Delete</Button>
```

**Button sizes:**
- `h-9` - Default
- `h-10` / `h-11` - Large
- `h-12` - Extra large (auth forms)

### Inputs

```tsx
// With label
<Input
  label="Email"
  placeholder="you@example.com"
  className="h-12 rounded-xl"
/>

// With icon
<div className="relative">
  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
  <Input className="pl-12 h-12 rounded-xl" />
</div>

// Password with toggle
<PasswordInput
  label="Password"
  showStrength
  strength={3}
/>
```

### Cards

```tsx
// Standard card
<div className="p-5 bg-card rounded-3xl border shadow-sm">
  Content
</div>

// Interactive card (hover state)
<button className="p-5 bg-card rounded-3xl border shadow-sm hover:bg-accent hover:shadow-md transition-all">
  Clickable
</button>

// Stat card with icon
<div className="flex items-center gap-4 p-5 rounded-3xl border bg-card">
  <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
    <Icon className="h-6 w-6 text-orange-500" />
  </div>
  <div>
    <p className="text-sm text-muted-foreground">Label</p>
    <p className="text-2xl font-bold">Value</p>
  </div>
</div>
```

### Modals / Dialogs

```tsx
<div className="bg-card rounded-2xl p-6 shadow-lg max-w-md w-full">
  <h2 className="text-xl font-semibold mb-4">Title</h2>
  <p className="text-muted-foreground mb-6">Description</p>
  <div className="flex gap-3 justify-end">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </div>
</div>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
    <Icon className="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold">No items</h3>
  <p className="text-muted-foreground mt-1 mb-4">Description here</p>
  <Button>Action</Button>
</div>
```

### Error States

```tsx
<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
  <AlertCircle className="h-5 w-5 shrink-0" />
  <span>Error message</span>
</div>
```

---

## Layout Patterns

### Auth Pages

```tsx
// Centered card on gradient background
<div className="min-h-screen flex items-center justify-center px-4">
  <div className="bg-card rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full">
    <h2 className="text-3xl font-bold mb-2">Title</h2>
    <p className="text-muted-foreground text-lg mb-8">Subtitle</p>
    {/* Form content */}
  </div>
</div>
```

### Dashboard Pages

```tsx
<div className="space-y-8 max-w-7xl mx-auto">
  {/* Header */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-3xl font-bold mb-2">Page Title</h1>
      <p className="text-muted-foreground text-lg">Description</p>
    </div>
    <Button>Primary Action</Button>
  </div>

  {/* Content */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Cards */}
  </div>
</div>
```

### Sidebar Layout

```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset className="flex flex-col h-screen overflow-hidden">
    <header className="flex h-16 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
    </header>
    <main className="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  </SidebarInset>
</SidebarProvider>
```

---

## Loading States

### Skeletons

```tsx
<Skeleton className="h-12 w-12 rounded-2xl" />  // Icon placeholder
<Skeleton className="h-5 w-32" />                // Text placeholder
<Skeleton className="h-20 w-full rounded-3xl" /> // Card placeholder
```

### Spinners

```tsx
<Loader2 className="h-4 w-4 animate-spin" />

// Full page loading
<div className="min-h-screen flex items-center justify-center">
  <div className="animate-pulse text-muted-foreground">
    Loading...
  </div>
</div>
```

---

## Shadows

```css
shadow-sm     /* Subtle elevation for cards */
shadow-lg     /* Modals, popovers */
shadow-primary/20  /* Colored glow for primary buttons */
```

---

## Transitions

```css
transition-all      /* General transitions */
transition-colors   /* Color-only changes */
duration-200        /* Default duration */

/* Hover states */
hover:bg-accent
hover:shadow-md
hover:text-foreground
```

---

## Icon Sizing

```tsx
<Icon className="h-4 w-4" />  // Inline with text, buttons
<Icon className="h-5 w-5" />  // Input icons, list items
<Icon className="h-6 w-6" />  // Card icons, stat cards
<Icon className="h-8 w-8" />  // Empty states, large features
```

---

## Dividers

```tsx
// Horizontal
<div className="border-t border-border" />

// With text
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-border" />
  </div>
  <div className="relative flex justify-center">
    <span className="bg-background px-4 text-muted-foreground text-sm">
      or
    </span>
  </div>
</div>
```

---

## Quick Reference

| Element | Border Radius | Height | Padding |
|---------|--------------|--------|---------|
| Small button | `rounded-md` | `h-8` | `px-3` |
| Default button | `rounded-xl` | `h-9`-`h-11` | `px-4`-`px-6` |
| Large button | `rounded-2xl` | `h-12` | `px-6` |
| Input | `rounded-xl` | `h-9`-`h-12` | `px-3` |
| Card | `rounded-3xl` | - | `p-5`-`p-6` |
| Modal | `rounded-2xl` | - | `p-6`-`p-8` |
| Icon container | `rounded-2xl` | `h-12 w-12` | - |
| Avatar | `rounded-full` | varies | - |

---

## Key Principles

1. **Dark-first**: Design for dark mode, light mode as secondary
2. **Soft corners**: Use large border-radius (20px+) for friendliness
3. **Subtle depth**: Light shadows, semi-transparent borders
4. **Consistent spacing**: Use 4/8px grid (gap-1 = 4px, gap-2 = 8px)
5. **Muted accents**: Use color sparingly, mostly for actions and states
6. **Responsive**: Mobile-first, stack on small screens, grid on large
