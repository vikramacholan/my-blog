const contentful = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
});

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

function createParagraph(text) {
  return {
    nodeType: 'paragraph',
    data: {},
    content: [
      {
        nodeType: 'text',
        value: text,
        marks: [],
        data: {}
      }
    ]
  };
}

function createHeading(level, text) {
  return {
    nodeType: `heading-${level}`,
    data: {},
    content: [
      {
        nodeType: 'text',
        value: text,
        marks: [],
        data: {}
      }
    ]
  };
}

function createTableRow(cells, isHeader = false) {
  return {
    nodeType: 'table-row',
    data: {},
    content: cells.map(cellText => ({
      nodeType: isHeader ? 'table-header-cell' : 'table-cell',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: cellText,
              marks: isHeader ? [{ type: 'bold' }] : [],
              data: {}
            }
          ]
        }
      ]
    }))
  };
}

function createTable(rows) {
  return {
    nodeType: 'table',
    data: {},
    content: rows.map((row, i) => createTableRow(row, i === 0))
  };
}

function createList(items) {
  return {
    nodeType: 'unordered-list',
    data: {},
    content: items.map(item => ({
      nodeType: 'list-item',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: item,
              marks: [],
              data: {}
            }
          ]
        }
      ]
    }))
  };
}

const { richTextFromMarkdown } = require('@contentful/rich-text-from-markdown');

async function run() {
  try {
    console.log('Fetching latest blog post...');
    const entries = await client.entry.getMany({
      spaceId: SPACE_ID,
      environmentId: ENVIRONMENT_ID,
      query: {
        content_type: 'blogPost',
        order: '-fields.publishDate',
        limit: 1
      }
    });

    if (entries.items.length === 0) {
      console.log('No blog posts found.');
      return;
    }

    let latestPost = entries.items[0];
    console.log(`Updating post: ${latestPost.fields.title['en-US']}`);

    // Update Author Name
    const authorRef = latestPost.fields.author && latestPost.fields.author['en-US'];
    if (authorRef && authorRef.sys.id) {
      console.log(`Updating author: ${authorRef.sys.id}`);
      let authorEntry = await client.entry.get({
        spaceId: SPACE_ID,
        environmentId: ENVIRONMENT_ID,
        entryId: authorRef.sys.id
      });
      authorEntry.fields.name['en-US'] = 'Vikram';
      const updatedAuthor = await client.entry.update({
        spaceId: SPACE_ID,
        environmentId: ENVIRONMENT_ID,
        entryId: authorRef.sys.id
      }, authorEntry);
      
      await client.entry.publish({
        spaceId: SPACE_ID,
        environmentId: ENVIRONMENT_ID,
        entryId: authorRef.sys.id
      }, updatedAuthor);
      console.log('Author updated and published.');
    }

    const markdown = `
The enterprise digital experience landscape is rapidly shifting. While traditional platforms have evolved—most notably with Sitecore’s push into headless via XM Cloud—evaluating modern architecture often comes down to one core question: Can we achieve the exact same business outcome with fewer servers, fewer licenses, fewer moving parts, and less overall maintenance?

For many projects, the answer leads directly to Contentful and Next.js.

While Sitecore XM Cloud provides a robust path to headless, it still carries the architectural weight of a legacy platform. Contentful, paired with the Next.js App Router and Vercel, strips the digital experience down to its most efficient, practical form.

If you are coming from the Sitecore ecosystem and are curious about pure composable architecture, here is why this stack is worth your time—and exactly how to start building.

## The Paradigm Shift: Mapping Sitecore to Contentful
Moving to Contentful requires a shift in how you think about content. In Sitecore, content and presentation are deeply intertwined via Presentation Details and the Layout Service. Contentful is strictly a pure headless data repository—it has absolutely no opinion on how your frontend looks.

To help translate your existing knowledge, here is how the core building blocks map out:

* **Template & Standard Values ➔ Content Type / Content Model**: The structural blueprint of your data.
* **Item ➔ Entry**: The actual instance of your content.
* **Field ➔ Field**: The individual data points (text, booleans, references).
* **Media Library ➔ Assets**: Where images and files are globally stored and optimized.
* **Web Database / Edge ➔ Delivery API**: Contentful’s CDN-backed API for querying published data.
* **Presentation Details / Renderings ➔ Your Next.js Application**: You have total control over the UI layer.

## The "Zero-Friction" Sandbox: Contentful’s Free Tier
One of the most notoriously painful aspects of traditional enterprise CMS development is simply getting a local environment running. It often requires Docker containers, heavy memory allocations, local SQL servers, SOLR instances, and highly restricted partner license files.

Contentful completely eliminates this friction.

Their Community Edition (Free Tier) is perhaps the biggest advantage for developers looking to upskill or architects building a proof-of-concept.

* **No License Files Required**: You can sign up using your GitHub or Google account and be inside the dashboard in under 30 seconds.
* **Zero Local Infrastructure**: There are no databases to spin up or containers to manage. The backend is completely SaaS.
* **Enterprise-Grade APIs**: Even on the free tier, you get full access to their incredibly fast GraphQL and REST APIs.
* **Generous Limits**: The community tier provides more than enough bandwidth, records, and API calls to run a fully functional personal blog, a startup website, or an enterprise pilot project.

## Getting Your Hands Dirty: The Quick Start Guide
Ready to build? Here is the most practical path to getting your first Contentful + Next.js project live.

### 1. Set Up Your Contentful Architecture
* Navigate to Contentful.com and sign up for the free tier.
* Follow the onboarding to create your first Organization and Space. (Think of a Space as your project database).
* Go to the Content Model tab and click Add content type (e.g., Blog Post).
* Add your fields (Title, Slug, Rich Text Body, Date).
* Navigate to the Content tab, create an entry based on your new model, and hit Publish.

### 2. Secure Your API Tokens
To connect your Next.js frontend, you need specific tokens from your Contentful Space. Go to Settings > API keys to find:

* **Space ID**: The unique identifier for your project.
* **Delivery API Token**: Used to fetch your published, production-ready content.
* **Preview API Token**: Used to fetch draft content (perfect for Next.js Draft Mode).

### 3. Deploy Instantly with Vercel
Rather than managing Azure App Services or complex CI/CD DevOps pipelines, we can leverage Vercel to handle the edge network natively.

* Initialize a Next.js App Router project and push your code to GitHub.
* Sign up for a free Vercel Hobby account and click Add New Project.
* Import your GitHub repository.
* Before clicking deploy, add your Contentful tokens into Vercel’s Environment Variables section.
* Click Deploy.

Within minutes, Vercel will build your application, fetch your Contentful data at build time (or on-demand via Next.js caching), and distribute a highly performant, server-rendered site to the edge.
    `;

    const richText = await richTextFromMarkdown(markdown);
    
    latestPost.fields.content['en-US'] = richText;
    
    const updatedPost = await client.entry.update({
      spaceId: SPACE_ID,
      environmentId: ENVIRONMENT_ID,
      entryId: latestPost.sys.id
    }, latestPost);
    
    await client.entry.publish({
      spaceId: SPACE_ID,
      environmentId: ENVIRONMENT_ID,
      entryId: updatedPost.sys.id
    }, updatedPost);

    console.log('Blog post updated and published successfully.');

  } catch (error) {
    if (error.details) {
       console.error('Error details:', JSON.stringify(error.details, null, 2));
    } else {
       console.error(error);
    }
  }
}

run();
