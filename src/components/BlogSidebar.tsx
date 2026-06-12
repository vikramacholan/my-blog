import Image from 'next/image';
import Link from 'next/link';
import { fetchEntries } from '@/lib/contentful';
import { TypeBlogPostSkeleton } from '@/types/contentful';

export default async function BlogSidebar() {
  // Fetch blog posts sorted by publishDate descending
  const posts = await fetchEntries<TypeBlogPostSkeleton>('blogPost', {
    order: '-fields.publishDate'
  });

  return (
    <aside className="w-full lg:w-96 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Posts</h2>
        <div className="space-y-6">
          {posts.map((post) => {
            const { title, slug, excerpt, publishDate, featuredImage, author } = post.fields as any;
            
            const imageUrl = featuredImage?.fields?.file?.url 
              ? `https:${featuredImage.fields.file.url}` 
              : null;
              
            const authorName = author?.fields?.name || 'Unknown Author';
            const authorAvatarUrl = author?.fields?.avatar?.fields?.file?.url 
              ? `https:${author.fields.avatar.fields.file.url}` 
              : null;
              
            const formattedDate = new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }).format(new Date(publishDate));

            return (
              <Link 
                key={post.sys.id} 
                href={`/blogs/${slug}`} 
                className="group flex flex-col rounded-lg overflow-hidden transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200 p-3 -mx-3"
              >
                <div className="flex items-start space-x-4">
                  {imageUrl ? (
                    <div className="flex-shrink-0 relative h-20 w-24 rounded-md overflow-hidden shadow-sm">
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="96px"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 relative h-20 w-24 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 mb-1">
                      <time dateTime={publishDate}>{formattedDate}</time>
                    </p>
                    <p className="text-base font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                      {title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {authorName}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {posts.length === 0 && (
          <div className="text-center text-gray-500 py-12 text-sm">
            No blog posts found.
          </div>
        )}
      </div>
    </aside>
  );
}
