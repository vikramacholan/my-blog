# Milestone 2: Persistent Blog Post View Counter via Upstash Redis

Implement a persistent, race-condition-safe view counter for each blog post using `@upstash/redis`. The count displays in the blog post hero section next to the author name and survives deployments.

## User Review Required

> [!IMPORTANT]
> **New Dependency:** This plan installs `@upstash/redis` (the official Upstash SDK). This is a lightweight, serverless-first HTTP client — no heavy infrastructure.

> [!WARNING]
> **Environment Variable Mapping:** Your `.env.local` uses Vercel's custom-prefixed names (`viklab_upstash_redis_KV_REST_API_URL` / `viklab_upstash_redis_KV_REST_API_TOKEN`). However, `Redis.fromEnv()` expects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. We have two options:
>
> 1. **(Recommended) Add alias env vars** — Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` lines to `.env.local` pointing to the same values. This lets us use the idiomatic `Redis.fromEnv()` pattern as the rule specifies.
> 2. **Manual initialization** — Use `new Redis({ url: ..., token: ... })` with the existing prefixed env vars. This deviates from the rule's prescribed `Redis.fromEnv()` pattern.
>
> I will implement **Option 1** unless you prefer otherwise.

## Proposed Changes

### 1. Dependencies & Environment

#### Install `@upstash/redis`
```bash
npm install @upstash/redis
```

#### [MODIFY] [.env.local](file:///c:/viklab/my-blog/.env.local)
Add standard Upstash env var aliases so `Redis.fromEnv()` works:
```
UPSTASH_REDIS_REST_URL=https://correct-camel-102347.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAY_LAAIgcDI4Mjg3ZjYwYWQzNjU0YzgzYTQ1YTFkNjg1NmYxZTNhZg
```

---

### 2. Redis Client Library

#### [NEW] [redis.ts](file:///c:/viklab/my-blog/src/lib/redis.ts)
A single-file Redis client module following the [upstash-redis.md](file:///c:/viklab/my-blog/.agents/rules/upstash-redis.md) rule:

```typescript
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();
```

- Centralized — every file imports from here.
- `Redis.fromEnv()` reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically.

---

### 3. Route Handler (Backend — Atomic Increment)

#### [NEW] [route.ts](file:///c:/viklab/my-blog/src/app/api/views/[slug]/route.ts)

- **`POST` handler** — Atomically increments the view count for the given slug.
- Uses `await redis.incr(`pageviews:blog:${slug}`)` (atomic — no GET+SET race condition).
- Returns the new count as JSON: `{ views: number }`.
- Wrapped in `try/catch` with graceful degradation (returns `{ views: 0 }` on error).
- Exports `dynamic = 'force-dynamic'` to prevent Next.js from caching/pre-rendering this route.
- Uses Next.js 16 `params: Promise<{ slug: string }>` pattern.

```typescript
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const views = await redis.incr(`pageviews:blog:${slug}`);
    return Response.json({ views });
  } catch (error) {
    console.error('Failed to increment view count:', error);
    return Response.json({ views: 0 });
  }
}
```

---

### 4. Client-Side View Tracker Component

#### [NEW] [ViewTracker.tsx](file:///c:/viklab/my-blog/src/components/ViewTracker.tsx)

A lightweight `"use client"` component that fires a single `POST` to `/api/views/[slug]` on mount. This is the **only** place where `incr` is triggered — keeping it client-side prevents build-time inflation (as required by the upstash-redis rule).

```typescript
'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire-and-forget — don't block rendering
    fetch(`/api/views/${slug}`, { method: 'POST' }).catch(() => {});
  }, [slug]);

  return null; // invisible component
}
```

- Renders nothing — zero UI impact.
- `useEffect` ensures this only fires in the browser after mount, never during SSR/SSG.

---

### 5. Blog Post Page Integration

#### [MODIFY] [page.tsx](file:///c:/viklab/my-blog/src/app/blogs/[slug]/page.tsx)

Two additions to the existing blog post page:

**a) Server-side view count fetch (for display):**
- Import `redis` from `@/lib/redis`.
- After fetching the blog post, call `await redis.get<number>(`pageviews:blog:${slug}`)`.
- Wrap in `try/catch`, fallback to `0`.
- This is a **read-only** `GET` — safe to run in a Server Component render cycle (no mutation).

**b) Inject view count into the hero section:**
- Add the view count adjacent to the author block (lines 108-111 of current file).
- Use an eye icon (SVG inline) + count + "views" label.
- Style with existing Tailwind classes (`text-sm text-gray-500`) to match the "Author" label.

**c) Embed `<ViewTracker>` component:**
- Import and render `<ViewTracker slug={slug} />` inside the article, after the header.
- This invisible client component handles the increment on page visit.

The hero metadata row will look approximately like:

```
[Avatar] Vikram          👁 42 views
         Author
```

The view count and author info will be in a flex row with `justify-center` and `gap-6`.

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| [.env.local](file:///c:/viklab/my-blog/.env.local) | MODIFY | Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` aliases |
| [src/lib/redis.ts](file:///c:/viklab/my-blog/src/lib/redis.ts) | NEW | Centralized Redis client via `Redis.fromEnv()` |
| [src/app/api/views/[slug]/route.ts](file:///c:/viklab/my-blog/src/app/api/views/%5Bslug%5D/route.ts) | NEW | POST route handler — atomic `incr` |
| [src/components/ViewTracker.tsx](file:///c:/viklab/my-blog/src/components/ViewTracker.tsx) | NEW | Client component — fires POST on mount |
| [src/app/blogs/[slug]/page.tsx](file:///c:/viklab/my-blog/src/app/blogs/%5Bslug%5D/page.tsx) | MODIFY | Display view count in hero + embed ViewTracker |

## Rules Compliance Checklist

| Rule | How Addressed |
|------|--------------|
| Atomic `INCR` only (no GET→SET) | Route handler uses `redis.incr()` exclusively |
| No build-time mutations | Increment is client-triggered via `useEffect` in `ViewTracker` |
| `Redis.fromEnv()` initialization | `src/lib/redis.ts` uses exactly this pattern |
| Graceful degradation with `try/catch` | Both the route handler and the server-side read wrap in `try/catch` with `0` fallback |
| Key naming: `entity:type:identifier` | Keys follow `pageviews:blog:{slug}` convention |

## Verification Plan

### Automated Tests
- `npm run build` — Ensure the project compiles without errors, and importantly, that no `incr` calls leak into the build phase.

### Manual Verification
- Open a blog post and verify the view count appears next to the author name.
- Refresh the page and confirm the count increments by 1.
- Check browser DevTools Network tab to confirm only a single `POST /api/views/[slug]` fires per page load.
- Temporarily disable Upstash (e.g. invalid token) and verify the page still renders with a view count of `0`.
