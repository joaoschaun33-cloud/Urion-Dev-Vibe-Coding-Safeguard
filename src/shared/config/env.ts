/**
 * Environment Variables Schema — Validação com Zod
 *
 * Em produção, DATABASE_URL e CORS_ORIGIN são obrigatórios.
 * Em dev/test, são opcionais para permitir uso sem infraestrutura completa.
 * A aplicação falha na startup (fail-fast) com mensagem clara.
 */

import { z } from 'zod';

export const envSchema = z
  .object({
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().optional(),
    CORS_ORIGIN: z.string().optional(),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379'),
    REDIS_URL: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!data.DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message:
            'DATABASE_URL é obrigatório em ambiente de produção. ' +
            'Defina a variável no .env ou nas variáveis de ambiente do host.',
        });
      }
      if (!data.CORS_ORIGIN) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CORS_ORIGIN'],
          message:
            'CORS_ORIGIN é obrigatório em ambiente de produção. ' +
            'Defina a URL de origem permitida (ex: https://urion.ia.br).',
        });
      }
    }
  });

export const env = envSchema.parse(process.env);
