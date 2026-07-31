import { Request, Response } from 'express';
import { prisma } from '@/shared/infrastructure/database';
import { redis } from '@/shared/infrastructure/redis';
import { logger } from '@/shared/infrastructure/logger';

/**
 * Liveness Probe (/health/live)
 * Indica se o processo Node.js está ativo e aceitando conexões básicas.
 * Não verifica dependências externas (DB/Cache).
 */
export const livenessCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
  });
};

/**
 * Readiness Probe (/health/ready)
 * Verifica a saúde de todas as dependências de infraestrutura necessárias
 * para processar tráfego real (PostgreSQL via Prisma + Redis).
 */
export const readinessCheck = async (_req: Request, res: Response): Promise<void> => {
  const health: {
    status: 'ok' | 'degraded';
    timestamp: string;
    uptimeSeconds: number;
    services: {
      database: { status: string; responseTimeMs: number };
      redis: { status: string; responseTimeMs: number };
    };
  } = {
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
    await redis.ping();
    health.services.redis.status = 'up';
    health.services.redis.responseTimeMs = Date.now() - redisStart;
  } catch (err) {
    health.status = 'degraded';
    logger.error({ event: 'HEALTH_CHECK_REDIS_FAILED', error: err });
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};

export const deepHealthCheck = readinessCheck;
