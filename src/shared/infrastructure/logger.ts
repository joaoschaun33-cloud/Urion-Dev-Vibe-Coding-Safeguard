import pino from 'pino';

/**
 * Logger estruturado em JSON.
 * Nunca logue dados sensiveis (senhas, tokens, CPF).
 */

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'password',
      'secret',
      'token',
      'authorization',
      'cpf',
      'creditCard',
      'req.headers.authorization',
      'req.body.password',
      'req.body.cpf'
    ],
    censor: '[REDACTED_PII]'
  },
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }),
  },
  base: {
    service: process.env.APP_NAME ?? 'vibe-app',
    env: process.env.NODE_ENV ?? 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
});
