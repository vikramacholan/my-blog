import { createClient } from 'contentful-management';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!spaceId || !managementToken) {
  console.error('Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in .env.local');
  process.exit(1);
}

const client = createClient({
  accessToken: managementToken,
});

const commonParams = { spaceId, environmentId: 'master' };

async function run() {
  try {
    console.log('--- Creating Content Types ---');

    // 1. Author
    let authorType = await client.contentType.get({ ...commonParams, contentTypeId: 'author' }).catch(() => null);
    if (!authorType) {
      authorType = await client.contentType.createWithId({ ...commonParams, contentTypeId: 'author' }, {
        name: 'Author',
        fields: [
          { id: 'name', name: 'Name', type: 'Symbol', required: true },
          { id: 'slug', name: 'Slug', type: 'Symbol', required: true },
          { id: 'avatar', name: 'Avatar', type: 'Link', linkType: 'Asset' },
          { id: 'bio', name: 'Bio', type: 'Text' }
        ]
      });
      await client.contentType.publish({ ...commonParams, contentTypeId: 'author' }, authorType);
      console.log('Created Author content type.');
    } else {
      console.log('Author content type already exists.');
    }

    // 2. Category
    let categoryType = await client.contentType.get({ ...commonParams, contentTypeId: 'category' }).catch(() => null);
    if (!categoryType) {
      categoryType = await client.contentType.createWithId({ ...commonParams, contentTypeId: 'category' }, {
        name: 'Category',
        fields: [
          { id: 'title', name: 'Title', type: 'Symbol', required: true },
          { id: 'slug', name: 'Slug', type: 'Symbol', required: true },
          { id: 'description', name: 'Description', type: 'Text' }
        ]
      });
      await client.contentType.publish({ ...commonParams, contentTypeId: 'category' }, categoryType);
      console.log('Created Category content type.');
    } else {
      console.log('Category content type already exists.');
    }

    // 3. SeoMetadata
    let seoType = await client.contentType.get({ ...commonParams, contentTypeId: 'seoMetadata' }).catch(() => null);
    if (!seoType) {
      seoType = await client.contentType.createWithId({ ...commonParams, contentTypeId: 'seoMetadata' }, {
        name: 'SEO Metadata',
        fields: [
          { id: 'metaTitle', name: 'Meta Title', type: 'Symbol' },
          { id: 'metaDescription', name: 'Meta Description', type: 'Symbol' },
          { id: 'openGraphImage', name: 'Open Graph Image', type: 'Link', linkType: 'Asset' },
          { id: 'noIndex', name: 'No Index', type: 'Boolean' }
        ]
      });
      await client.contentType.publish({ ...commonParams, contentTypeId: 'seoMetadata' }, seoType);
      console.log('Created SeoMetadata content type.');
    } else {
      console.log('SeoMetadata content type already exists.');
    }

    // 4. BlogPost
    let blogPostType = await client.contentType.get({ ...commonParams, contentTypeId: 'blogPost' }).catch(() => null);
    if (!blogPostType) {
      blogPostType = await client.contentType.createWithId({ ...commonParams, contentTypeId: 'blogPost' }, {
        name: 'Blog Post',
        fields: [
          { id: 'title', name: 'Title', type: 'Symbol', required: true },
          { id: 'slug', name: 'Slug', type: 'Symbol', required: true },
          { id: 'publishDate', name: 'Publish Date', type: 'Date', required: true },
          { id: 'featuredImage', name: 'Featured Image', type: 'Link', linkType: 'Asset' },
          { id: 'excerpt', name: 'Excerpt', type: 'Symbol' },
          { id: 'content', name: 'Content', type: 'RichText' },
          { id: 'author', name: 'Author', type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['author'] }] },
          { id: 'categories', name: 'Categories', type: 'Array', items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['category'] }] } },
          { id: 'seo', name: 'SEO', type: 'Link', linkType: 'Entry', validations: [{ linkContentType: ['seoMetadata'] }] }
        ]
      });
      await client.contentType.publish({ ...commonParams, contentTypeId: 'blogPost' }, blogPostType);
      console.log('Created BlogPost content type.');
    } else {
      console.log('BlogPost content type already exists.');
    }

    console.log('--- Uploading AI Image ---');
    const imagePath = process.argv[2];
    let imageAsset = null;
    if (imagePath && fs.existsSync(imagePath)) {
      const fileContent = fs.readFileSync(imagePath);
      // Create upload first
      const upload = await client.upload.create({ ...commonParams }, { file: fileContent });
      
      imageAsset = await client.asset.create({ ...commonParams }, {
        fields: {
          title: { 'en-US': 'Tech Blog Cover' },
          file: {
            'en-US': {
              contentType: 'image/png',
              fileName: 'tech_blog_cover.png',
              uploadFrom: {
                sys: { type: 'Link', linkType: 'Upload', id: upload.sys.id }
              }
            }
          }
        }
      });
      
      await client.asset.processForAllLocales({ ...commonParams, assetId: imageAsset.sys.id }, imageAsset);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      imageAsset = await client.asset.get({ ...commonParams, assetId: imageAsset.sys.id });
      await client.asset.publish({ ...commonParams, assetId: imageAsset.sys.id }, imageAsset);
      console.log('Image Asset uploaded and published.');
    }

    console.log('--- Creating Sample Entries ---');
    
    // Create Author
    let authorEntry = await client.entry.create({ ...commonParams, contentTypeId: 'author' }, {
      fields: {
        name: { 'en-US': 'Alex Architect' },
        slug: { 'en-US': 'alex-architect' },
        bio: { 'en-US': 'Lead Hands-On Architect transitioning to Next.js and Contentful.' }
      }
    });
    await client.entry.publish({ ...commonParams, entryId: authorEntry.sys.id }, authorEntry);

    // Create Category
    let categoryEntry = await client.entry.create({ ...commonParams, contentTypeId: 'category' }, {
      fields: {
        title: { 'en-US': 'Architecture' },
        slug: { 'en-US': 'architecture' },
        description: { 'en-US': 'Posts about modern web architecture and headless CMS.' }
      }
    });
    await client.entry.publish({ ...commonParams, entryId: categoryEntry.sys.id }, categoryEntry);

    // Create BlogPost
    const richTextContent = {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            { nodeType: 'text', value: 'Transitioning from Sitecore XM Cloud to a modern headless stack like Contentful and Next.js has been an eye-opening journey.', marks: [], data: {} }
          ]
        },
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            { nodeType: 'text', value: 'If you already have knowledge in Sitecore XM Cloud, picking up Contentful is remarkably intuitive. The concepts of templates, rendering variants, and content trees map beautifully to Contentful\'s Content Types and Reference fields. However, Contentful removes much of the heavyweight infrastructure overhead, allowing us to focus entirely on the API-first delivery and the frontend experience.', marks: [], data: {} }
          ]
        },
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            { nodeType: 'text', value: 'With Next.js App Router, we can leverage native fetch caching to fetch Contentful data at edge speeds, creating a seamless and lightning-fast developer and user experience. Tailwind CSS handles our styling cleanly without the need for bloated global CSS files. It is simply a breath of fresh air.', marks: [], data: {} }
          ]
        }
      ]
    };

    let blogPostFields = {
      title: { 'en-US': 'Why We Chose Contentful and Next.js Over Sitecore' },
      slug: { 'en-US': 'why-we-chose-contentful-and-nextjs' },
      publishDate: { 'en-US': new Date().toISOString() },
      excerpt: { 'en-US': 'Discover how easily you can transition from Sitecore XM Cloud to Contentful and Next.js for a more agile, high-performance headless architecture.' },
      content: { 'en-US': richTextContent },
      author: { 'en-US': { sys: { type: 'Link', linkType: 'Entry', id: authorEntry.sys.id } } },
      categories: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: categoryEntry.sys.id } }] }
    };

    if (imageAsset) {
      blogPostFields.featuredImage = { 'en-US': { sys: { type: 'Link', linkType: 'Asset', id: imageAsset.sys.id } } };
    }

    let blogPostEntry = await client.entry.create({ ...commonParams, contentTypeId: 'blogPost' }, {
      fields: blogPostFields
    });
    await client.entry.publish({ ...commonParams, entryId: blogPostEntry.sys.id }, blogPostEntry);
    console.log('Sample Blog Post created and published.');

    console.log('--- Setup Complete ---');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

run();
