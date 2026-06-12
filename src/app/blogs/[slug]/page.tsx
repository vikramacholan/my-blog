import { notFound } from 'next/navigation';
import Image from 'next/image';
import { fetchEntryBySlug, fetchEntries } from '@/lib/contentful';
import { TypeBlogPostSkeleton } from '@/types/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Ensure dynamic rendering behavior if we want to build static pages
export async function generateStaticParams() {
  const posts = await fetchEntries<TypeBlogPostSkeleton>('blogPost');
  return posts.map((post) => ({
    slug: post.fields.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchEntryBySlug<TypeBlogPostSkeleton>('blogPost', slug);

  if (!post) {
    notFound();
  }

  const { title, publishDate, featuredImage, author, content } = post.fields as any;

  const imageUrl = featuredImage?.fields?.file?.url 
    ? `https:${featuredImage.fields.file.url}` 
    : null;

  const authorName = author?.fields?.name || 'Unknown Author';
  const authorAvatarUrl = author?.fields?.avatar?.fields?.file?.url 
    ? `https:${author.fields.avatar.fields.file.url}` 
    : null;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(publishDate));

  // Rich Text Rendering Options
  const renderOptions = {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const fileUrl = node.data.target.fields?.file?.url;
        const title = node.data.target.fields?.title || 'Embedded Image';
        if (fileUrl) {
          return (
            <div className="relative w-full h-96 my-8">
              <Image 
                src={`https:${fileUrl}`} 
                alt={title} 
                fill 
                className="object-cover rounded-lg" 
              />
            </div>
          );
        }
        return null;
      },
      [BLOCKS.HEADING_2]: (node: any, children: any) => (
        <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">{children}</h2>
      ),
      [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
        <p className="text-lg text-gray-700 leading-relaxed mb-6">{children}</p>
      ),
      [BLOCKS.UL_LIST]: (node: any, children: any) => (
        <ul className="list-disc pl-8 mb-6 text-lg text-gray-700">{children}</ul>
      ),
      [INLINES.HYPERLINK]: (node: any, children: any) => (
        <a href={node.data.uri} className="text-indigo-600 hover:text-indigo-800 underline">
          {children}
        </a>
      )
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 text-center">
        <p className="text-base font-medium text-indigo-600 tracking-wide mb-2">
          <time dateTime={publishDate}>{formattedDate}</time>
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
          {title}
        </h1>
        
        <div className="flex items-center justify-center">
          {authorAvatarUrl ? (
            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm mr-4">
              <Image
                src={authorAvatarUrl}
                alt={authorName}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4 shadow-sm">
              <span className="text-gray-600 font-bold text-lg">{authorName.charAt(0)}</span>
            </div>
          )}
          <div className="text-left">
            <p className="text-lg font-medium text-gray-900">{authorName}</p>
            <p className="text-sm text-gray-500">Author</p>
          </div>
        </div>
      </header>

      {imageUrl && (
        <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden shadow-lg mb-12">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="prose prose-indigo prose-lg max-w-none text-gray-800">
        {content ? documentToReactComponents(content, renderOptions) : null}
      </div>
    </article>
  );
}
