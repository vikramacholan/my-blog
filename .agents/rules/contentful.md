# Contentful Integration Standards

## Consuming Contentful Data
- Always use the official `contentful` SDK or native `fetch` combined with Contentful's GraphQL API for data fetching.
- Strictly type all API responses. Use the predefined interfaces in `src/types/contentful.d.ts`.
- Include robust error handling for missing data or failed requests.
- Never hardcode space IDs or access tokens. Use `process.env.CONTENTFUL_SPACE_ID` and `process.env.CONTENTFUL_ACCESS_TOKEN`.
- Handle rich text rendering using `@contentful/rich-text-react-renderer`.
