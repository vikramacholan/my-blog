import { EntryFieldTypes } from 'contentful';

export interface TypeAuthorSkeleton {
  contentTypeId: 'author';
  fields: {
    name: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    avatar: EntryFieldTypes.AssetLink;
    bio: EntryFieldTypes.Text;
  }
}

export interface TypeCategorySkeleton {
  contentTypeId: 'category';
  fields: {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    description: EntryFieldTypes.Text;
  }
}

export interface TypeSeoMetadataSkeleton {
  contentTypeId: 'seoMetadata';
  fields: {
    metaTitle: EntryFieldTypes.Symbol;
    metaDescription: EntryFieldTypes.Symbol;
    openGraphImage: EntryFieldTypes.AssetLink;
    noIndex: EntryFieldTypes.Boolean;
  }
}

export interface TypeBlogPostSkeleton {
  contentTypeId: 'blogPost';
  fields: {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    publishDate: EntryFieldTypes.Date;
    featuredImage: EntryFieldTypes.AssetLink;
    excerpt: EntryFieldTypes.Symbol;
    content: EntryFieldTypes.RichText;
    author: EntryFieldTypes.EntryLink<TypeAuthorSkeleton>;
    categories: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeCategorySkeleton>>;
    seo: EntryFieldTypes.EntryLink<TypeSeoMetadataSkeleton>;
  }
}
