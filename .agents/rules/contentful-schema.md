---
trigger: model_decision
---

# Contentful Schema Definition

This document outlines the schema models that need to be configured in the Contentful UI.

## Model `author`
- **name**: Text (Short text)
- **slug**: Text (Short text)
- **avatar**: Media
- **bio**: Text (Long text)

## Model `category`
- **title**: Text (Short text)
- **slug**: Text (Short text)
- **description**: Text (Long text)

## Model `seoMetadata`
- **metaTitle**: Text (Short text, max 60 characters)
- **metaDescription**: Text (Short text, max 160 characters)
- **openGraphImage**: Media
- **noIndex**: Boolean

## Model `blogPost`
- **title**: Text (Short text)
- **slug**: Text (Short text)
- **publishDate**: Date
- **featuredImage**: Media
- **excerpt**: Text (Short text, max 200 characters)
- **content**: Rich text
- **author**: Reference (One reference to `author`)
- **categories**: Reference (Many references to `category`)
- **seo**: Reference (One reference to `seoMetadata`)
