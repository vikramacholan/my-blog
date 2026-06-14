import { Redis } from '@upstash/redis';

// Map custom Vercel environment variables to standard ones expected by Redis.fromEnv()
if (!process.env.UPSTASH_REDIS_REST_URL && process.env.viklab_upstash_redis_KV_REST_API_URL) {
  process.env.UPSTASH_REDIS_REST_URL = process.env.viklab_upstash_redis_KV_REST_API_URL;
}
if (!process.env.UPSTASH_REDIS_REST_TOKEN && process.env.viklab_upstash_redis_KV_REST_API_TOKEN) {
  process.env.UPSTASH_REDIS_REST_TOKEN = process.env.viklab_upstash_redis_KV_REST_API_TOKEN;
}

export const redis = Redis.fromEnv();

