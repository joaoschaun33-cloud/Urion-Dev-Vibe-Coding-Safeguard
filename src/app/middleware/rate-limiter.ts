/**
 * Rate Limiter — Proteção contra abuso de requisições
 *
 * Usa RedisStore para rate limiting stateful, permitindo
 * horizontal scaling com múltiplas instâncias da aplicação.
 *
 * Nota: O adapter de sendCommand faz um cast de tipos porque
 * ioredis retorna Promise<unknown> enquanto rate-limit-redis espera
 * Promise<RedisReply>. Os valores reais retornados pelo Redis
 * (string | number | null) são sempre compatíveis em runtime.
 */

import rateLimit from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { redis } from '@/shared/infrastructure/redis';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por janela por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://api.example.com/errors/too-many-requests',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Você excedeu o limite de requisições. Tente novamente em 15 minutos.',
  },
  store: new RedisStore({
    sendCommand: (...args: string[]): Promise<RedisReply> =>
      redis.call(args[0], ...args.slice(1)) as Promise<RedisReply>,
  }),
});
