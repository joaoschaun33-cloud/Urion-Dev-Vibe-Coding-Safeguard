// src/app/server.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';
import { logger } from '@/shared/infrastructure/logger';

dotenv.config();

import { env } from '@/shared/config/env';
import { requestIdMiddleware } from './middleware/request-id';

const app = express();
const PORT = Number(env.PORT);

import { rateLimiter } from './middleware/rate-limiter';
import { redis } from '@/shared/infrastructure/redis';

const isProduction = env.NODE_ENV === 'production';
const allowedOrigin = env.CORS_ORIGIN;

// Middlewares globais
app.use(requestIdMiddleware);

// Helmet — Hardening de segurança HTTP
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
          },
        }
      : false, // Desabilita CSP em dev para Vite HMR
    hsts: {
      maxAge: 63072000, // 2 anos
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: isProduction,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })
);

app.use(rateLimiter);

if (isProduction && !allowedOrigin) {
  logger.error(
    'CRITICAL: CORS_ORIGIN nao definido em ambiente de producao! Servidor recusando inicializacao.'
  );
  process.exit(1);
}

app.use(
  cors({
    origin: allowedOrigin ?? (isProduction ? false : 'http://localhost:5173'),
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10kb' }));

// Rotas
app.use('/api/v1', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    type: 'https://api.example.com/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: 'Endpoint nao encontrado',
  });
});

// Error handler (DEVE ser o ultimo middleware)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info({
    event: 'SERVER_STARTED',
    port: PORT,
    env: env.NODE_ENV,
    url: `http://localhost:${String(PORT)}`,
  });
});

// Graceful Shutdown Handler (Garantia de Produção)
const shutdown = (signal: string): void => {
  logger.info({ event: 'SERVER_SHUTTING_DOWN', signal });
  server.close(() => {
    (async (): Promise<void> => {
      try {
        const { prisma } = await import('@/shared/infrastructure/database');
        const { auditWorker } = await import('@/shared/infrastructure/queue');
        await auditWorker.close();
        await prisma.$disconnect();
        await redis.quit();
        logger.info({ event: 'INFRASTRUCTURE_DISCONNECTED_CLEANLY' });
      } catch (err) {
        logger.error({ event: 'SHUTDOWN_ERROR', error: err });
      } finally {
        process.exit(0);
      }
    })().catch((err: unknown) => {
      logger.error({ event: 'SHUTDOWN_UNHANDLED_ERROR', error: err });
      process.exit(1);
    });
  });
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  shutdown('SIGINT');
});

export default app;
