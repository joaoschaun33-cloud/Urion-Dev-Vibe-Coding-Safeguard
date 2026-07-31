import { Request, Response } from 'express';
import { prisma } from '@/shared/infrastructure/database';
import { redis } from '@/shared/infrastructure/redis';
import { logger } from '@/shared/infrastructure/logger';

export const deepHealthCheck = async (_req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    services: {
      database: { status: 'down', responseTimeMs: 0 },
      redis: { status: 'down', responseTimeMs: 0 },
    },
  };

  // Check PostgreSQL (Prisma)
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database.status = 'up';
    health.services.database.responseTimeMs = Date.now() - dbStart;
  } catch (err) {
    health.status = 'degraded';
    logger.error({ event: 'HEALTH_CHECK_DB_FAILED', error: err });
  }

  // Check Redis
  const redisStart = Date.now();
  try {
    const pingRes = await redis.ping();
    if (pingRes === 'PONG') {
      health.services.redis.status = 'up';
      health.services.redis.responseTimeMs = Date.now() - redisStart;
    }
  } catch (err) {
    health.status = 'degraded';
    logger.error({ event: 'HEALTH_CHECK_REDIS_FAILED', error: err });
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};
