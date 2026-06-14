import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const views = await redis.incr(`pageviews:blog:${slug}`);
    return Response.json({ views });
  } catch (error) {
    console.error('Failed to increment view count:', error);
    return Response.json({ views: 0 });
  }
}
