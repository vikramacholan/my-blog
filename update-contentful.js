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
## Sitecore XM vs Contentful Building Blocks

When moving from a traditional CMS like Sitecore XM to a headless architecture like Contentful, understanding the mapping of building blocks is crucial.

*   **Template** -> Content Type / Content Model
*   **Item** -> Entry
*   **Field** -> Field
*   **Media Library** -> Media / Assets
*   **Publishing** -> Publishing / Delivery API
*   **Layout / Rendering** -> Your Frontend Application (e.g. Next.js)

## How to create a Contentful account

*   Go to the Contentful website (contentful.com).
*   Click on "Sign Up" or "Get Started for Free".
*   Fill in your details (name, email, password) or sign up with Google/GitHub.
*   Follow the onboarding steps to set up your first organization and space.

## Creating Models and Content

*   Navigate to the "Content model" tab in the top navigation.
*   Click "Add content type" to create a new model (e.g., Blog Post).
*   Add fields to your model like Title (Text), Body (Rich text), and Date (Date and time).
*   Save your content model.
*   Go to the "Content" tab and click "Add entry" to create actual content based on your model.
*   Fill in the fields and click "Publish".

## Understanding Spaces, Environments, and Tokens

In Contentful, a Space is like a project database holding your content models, entries, and assets. Inside a Space, you can have multiple Environments (like "master", "staging", "dev") to test changes safely before pushing to production.

To access your content via the API, you need specific tokens:

*   **Space ID**: The unique identifier for your project space.
*   **Delivery API Access Token**: Used for fetching published content in your production app (Read-only).
*   **Preview API Access Token**: Used for fetching draft and unpublished content, perfect for Next.js Draft Mode.
*   **Management Token**: A personal access token used to programmatically create, edit, or delete content and models.

You can generate these tokens by going to Settings > API keys in your Contentful space.

## Deploying with GitHub and Vercel

*   Initialize a Git repository in your Next.js project folder and commit your code.
*   Create a new repository on GitHub and push your local code to it.
*   Go to Vercel.com and sign up for a free Hobby account.
*   Click "Add New Project" and import your GitHub repository.
*   In the Vercel configuration, make sure to add your Contentful Environment Variables (Space ID, Access Token, etc.).
*   Click Deploy! Vercel will build your Next.js app and provide a live URL.
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
