import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit' // for IP rate limiting
import 'dotenv/config'
const ratelimiter = new Ratelimit({
  redis: Redis.fromEnv(),

  limiter: Ratelimit.slidingWindow(100,"60s") // 100 requests per 60 seconds
});

export default ratelimiter;