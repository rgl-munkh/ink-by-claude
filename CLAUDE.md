# Design System

## Mobile-First Monochrome Minimal

### Component Library

- **Use [`shadcn/ui`](https://ui.shadcn.com/) components** for all UI elements.
- **Color system:** Use the [shadcn/ui default color palette](https://ui.shadcn.com/docs/theming#default-theme) (based on [Radix Colors](https://www.radix-ui.com/colors)), which supports light/dark mode and accessible contrast.
    - Example: `bg-background`, `text-foreground`, `border`, `primary`, `secondary`, `muted`, `accent`, etc.
    - Customize via CSS variables if needed, but prefer shadcn defaults for consistency and maintainability.

---

## Typography

- **Font:** Inter, or system fonts (`-apple-system`, `BlinkMacSystemFont`, etc.)
- **Mobile Scale:** 14px base, 16px for inputs (prevents iOS zoom)
- **Desktop Scale:** 16px base
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold)
- **Line Height:** 1.5 for body, 1.4 for headings
- **Letter Spacing:** -0.01em for improved mobile readability

---

## Responsive Breakpoints

| Name | Min Width | Usage                |
|------|-----------|----------------------|
| sm   | 640px     | Small tablets        |
| md   | 768px     | Tablets              |
| lg   | 1024px    | Small desktops       |
| xl   | 1280px    | Large desktops       |

---

## Mobile-First Component Guidelines

- **Touch targets:** Minimum 44px height (iOS/Android standard)
- **Spacing:** 16px base on mobile, 24px on desktop
- **Borders:** 1px solid, always visible (use `border` from shadcn)
- **Icons:** 20px on mobile, 24px on desktop
- **Buttons:** Full-width on mobile, auto width on desktop
- **Forms:** Single column on mobile, multi-column on desktop when appropriate
- **Navigation:** Bottom tab bar on mobile, top header on desktop
- **Content:** Vertical stack on mobile, horizontal layouts on desktop

---

> **Note:**  
> All colors, backgrounds, borders, and states should use the shadcn/ui color system and utility classes (e.g., `bg-primary`, `text-muted-foreground`, `border-accent`).  
> Avoid hardcoding color hex values; use the design tokens provided by shadcn for consistency and easy theming.