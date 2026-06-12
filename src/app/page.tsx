import { redirect } from 'next/navigation';
import { fetchEntries } from '@/lib/contentful';
import { TypeBlogPostSkeleton } from '@/types/contentful';

export default async function Home() {
  const posts = await fetchEntries<TypeBlogPostSkeleton>('blogPost', {
    order: '-fields.publishDate',
    limit: 1
  });

  if (posts && posts.length > 0) {
    const latestSlug = posts[0].fields.slug;
    redirect(`/blogs/${latestSlug}`);
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-12 text-center h-full">
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 max-w-lg">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          No Posts Found
        </h1>
        <p className="text-lg text-gray-500">
          Please create a blog post in Contentful to see it here.
        </p>
      </div>
    </div>
  );
}
