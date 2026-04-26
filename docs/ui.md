# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

Do not create custom UI components. Every UI element — buttons, inputs, dialogs, cards, tables, badges, etc. — must come from shadcn/ui. If a required component is not yet installed, add it via the CLI:

```bash
npx shadcn@latest add <component-name>
```

Installed components live in `src/components/ui/` and must not be modified unless strictly necessary to fix a bug.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/). Dates are displayed using ordinal day, abbreviated month, and full year:

| Date | Formatted output |
|------|-----------------|
| 2025-09-01 | 1st Sep 2025 |
| 2025-08-02 | 2nd Aug 2025 |
| 2026-01-03 | 3rd Jan 2026 |
| 2024-06-04 | 4th Jun 2024 |

Use `format` with the `do MMM yyyy` format string:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```
