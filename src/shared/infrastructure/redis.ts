import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn({ event: 'REDIS_RETRYING_CONNECTION', times, delay });
    return delay;
  },
});

redis.on('connect', () => {
  logger.info({ event: 'REDIS_CONNECTED', url: redisUrl });
});

redis.on('error', (err) => {
  logger.error({ event: 'REDIS_ERROR', error: err.message });
});
