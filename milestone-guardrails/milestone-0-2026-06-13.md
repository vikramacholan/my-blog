# Master-Detail Blog Layout Implementation

We will implement a two-column layout for your blog site, with the blog content displayed in the middle (left) area and a list of all blog posts in a right-hand sidebar. Clicking a post in the sidebar will navigate to `/blogs/[slug]` and render that specific post's content.

## User Review Required

> [!IMPORTANT]  
> We need to install `@contentful/rich-text-react-renderer` to properly render the rich text content from Contentful in the middle area. Please approve this new dependency.

## Open Questions

> [!WARNING]  
> **Landing Page Behavior**
> When a user visits the root URL `/`, what should they see in the middle area before they click on any blog post?
> 
> Options:
> 1. Redirect them automatically to the most recently published blog post (e.g., `/blogs/[latest-slug]`).
> 2. Show a welcome message or placeholder (e.g., "Welcome to my blog! Please select a post from the right to read.").
> 
> By default, I will implement **Option 2** (Welcome message) unless you prefer Option 1.

## Proposed Changes

### Dependencies

- **Install**: `@contentful/rich-text-react-renderer`

---

### Components

#### [NEW] `src/components/BlogSidebar.tsx`
- A Server Component that fetches all blog posts using `fetchEntries`.
- Renders the right-hand sidebar containing the list of blog post cards.
- Each card will link to `/blogs/[slug]`.

---

### App Router & Layout

#### [MODIFY] `src/app/layout.tsx`
- Implement a CSS Grid or Flexbox layout for the main body.
- Left/Middle column: `<main>` wrapper for `{children}`.
- Right column: Include the new `<BlogSidebar />` component.

#### [MODIFY] `src/app/page.tsx`
- Update the root landing page to remove the old grid of blog posts.
- Render a welcoming message or placeholder (depending on your answer to the Open Question) in the middle area.

#### [NEW] `src/app/blogs/[slug]/page.tsx`
- A Server Component that fetches a single blog post using `fetchEntryBySlug(slug)`.
- Renders the full blog post (title, cover image, author, date, and rich text content) in the middle area.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the project compiles without TypeScript or Next.js routing errors.

### Manual Verification
- Navigate to `/` and verify the right sidebar lists all blog posts and the middle shows the default state.
- Click a post from the sidebar.
- Verify the URL updates to `/blogs/[slug]`.
- Verify the selected post content loads successfully in the middle column.
