# Next.js & Tailwind CSS Standards

## Next.js App Router Conventions
- Strictly use the Next.js App Router (`src/app`).
- Maximize the use of Server Components by default. Use Client Components (`"use client"`) only when interactivity or client-side hooks are required.
- Leverage Next.js native caching capabilities rather than introducing new moving parts. Use `fetch` options like `{ next: { revalidate: 3600 } }` or `{ cache: 'force-cache' }`.

## Tailwind CSS Conventions
- Use clean Tailwind utility styling.
- Avoid extracting classes into generic custom CSS files unless strictly necessary for complex recurring patterns.
- Follow mobile-first responsive design principles.
