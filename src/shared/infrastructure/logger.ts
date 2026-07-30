import pino from 'pino';

/**
 * Logger estruturado em JSON.
 * Nunca logue dados sensiveis (senhas, tokens, CPF).
 */

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
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
