# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Stack

- **Next.js 16** (App Router) — see AGENTS.md warning about breaking changes
- **React 19**
- **TypeScript 5** with strict mode; path alias `@/*` → `src/*`
- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax (not `@tailwind` directives)
- **ESLint 9** flat config (`eslint.config.mjs`)

## Architecture

All source lives under `src/app/` using the Next.js App Router convention:

- `layout.tsx` — root layout; sets up Geist font CSS variables applied to `<html>`
- `page.tsx` — home route (`/`)
- `globals.css` — Tailwind v4 import + CSS custom properties for theme colors and font variables

Routing follows file-system conventions: new routes go in `src/app/<route>/page.tsx`. Shared UI components should live in `src/components/` (not yet created).

## Tailwind v4 Notes

The CSS config is done via `@theme inline` blocks in CSS files, not a `tailwind.config.*` JS file. Custom tokens (colors, fonts) are declared as CSS variables in `globals.css`.
