---
trigger: always_on
description: Apply rule when develop on Upstash redis database based logic implementation
---

# Upstash Redis Implementation Rules

## Context
This project uses the official `@upstash/redis` SDK for serverless Redis operations. When implementing counters, analytics, or caching mechanisms, strictly adhere to the following architectural guidelines to ensure data integrity, maintain performance, and prevent build-time artifacts.

## Core Directives

1. **Atomic Operations Only**
   - Never use a `GET` followed by a `SET` for counters. This introduces race conditions under concurrent traffic.
   - Always use the atomic `INCR` command via the SDK (e.g., `await redis.incr(key)`) to safely increment view counts.

2. **Prevent Build-Time Execution**
   - Next.js Server Components run during the static build phase (`next build`). Do NOT fire database mutation commands (like `incr`) directly inside the render cycle of a Server Component. 
   - Doing so will artificially inflate metrics every time Vercel builds the site or runs a health check.
   - **Requirement:** Tracking logic must be client-side triggered. Use a client component with a `useEffect` hook that hits a Route Handler (e.g., `/api/views/[slug]`), or invokes a Server Action asynchronously *after* the page mounts.

3. **SDK Initialization**
   - Use the environment-driven initializer to avoid hardcoding credentials.
   - Initialize the client exactly as follows:
     ```typescript
     import { Redis } from '@upstash/redis';
     const redis = Redis.fromEnv();
     ```
   - This automatically picks up `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

4. **Graceful Degradation**
   - If the Upstash REST API times out, fails, or returns `null` (e.g., a brand new post with no views yet), the application must not crash.
   - Always wrap KV operations in `try/catch` blocks and provide a safe fallback value (`0`) for UI rendering.

5. **Key Naming Conventions**
   - Namespace all keys to maintain a clean database structure.
   - Format: `entity:type:identifier` (e.g., `pageviews:blog:my-post-slug`).