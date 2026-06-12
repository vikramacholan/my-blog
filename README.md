# Headless Blog with Next.js & Contentful

This is a production-grade headless blog built with Next.js (App Router), TypeScript, Tailwind CSS, and Contentful CMS.

## Architecture

This project is designed to be highly maintainable and performant:
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **CMS Integration**: Contentful Delivery API
- **Caching**: Next.js native `fetch` caching is utilized for high performance and reduced API calls to Contentful.

## Contentful Configuration

You must configure the following content models in your Contentful space exactly as specified in `.agents/rules/contentful-schema.md`:
1. `author`
2. `category`
3. `seoMetadata`
4. `blogPost`

## Environment Variables

Create a `.env.local` file in the root of the project with the following keys:
```env
# Your Contentful Space ID
CONTENTFUL_SPACE_ID=your_space_id

# Your Contentful Delivery API access token
CONTENTFUL_ACCESS_TOKEN=your_access_token
```

> **Warning:** Never commit `.env.local` or your API keys to version control!

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Agent OS

This project uses an Agent OS configuration located in the `.agents/` directory.
It defines strict architectural rules, Tailwind conventions, and Contentful integration standards to ensure consistent code quality from AI agents.
