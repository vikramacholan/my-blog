import { createClient, EntrySkeletonType } from 'contentful';

// Use the official contentful SDK to create a client
// Note: In Next.js App Router, fetch is heavily cached. If you use contentful v10,
// it uses fetch under the hood. You can configure Next.js specific fetch options if needed.

const spaceId = process.env.CONTENTFUL_SPACE_ID || '';
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || '';

export const contentfulClient = createClient({
  space: spaceId,
  accessToken: accessToken,
});

/**
 * Utility to fetch entries with error handling.
 * It's recommended to call this inside Server Components.
 */
export async function fetchEntries<T extends EntrySkeletonType>(contentType: string, query: Record<string, any> = {}) {
  try {
    if (!spaceId || !accessToken) {
      throw new Error('Contentful space ID and access token must be provided.');
    }

    const entries = await contentfulClient.getEntries<T>({
      content_type: contentType,
      ...query
    });

    if (!entries || !entries.items || entries.items.length === 0) {
      console.warn(`No entries found for content type: ${contentType}`);
      return [];
    }

    return entries.items;
  } catch (error) {
    console.error(`Error fetching entries for ${contentType}:`, error);
    return [];
  }
}

/**
 * Utility to fetch a single entry by its slug.
 */
export async function fetchEntryBySlug<T extends EntrySkeletonType>(contentType: string, slug: string) {
  try {
    const entries = await fetchEntries<T>(contentType, {
      'fields.slug': slug,
      limit: 1
    });

    if (entries.length > 0) {
      return entries[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching entry with slug ${slug}:`, error);
    return null;
  }
}
