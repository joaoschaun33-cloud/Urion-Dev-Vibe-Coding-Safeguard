import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
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
    // @ts-expect-error ioredis compatible sendCommand
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});
