/**
 * Queue Infrastructure — BullMQ com DLQ e Retry com Backoff Exponencial
 *
 * Padrões implementados:
 * - Dead Letter Queue (DLQ): jobs que falham após max retries são movidos
 *   para a fila `audit-dlq` para investigação e reprocessamento manual.
 * - Backoff Exponencial: 1s → 2s → 4s (3 tentativas antes de DLQ).
 * - Logging estruturado em todos os eventos do ciclo de vida do job.
 */

import { Queue, Worker } from 'bullmq';
import { logger } from '@/shared/infrastructure/logger';

const redisHost = process.env.REDIS_HOST ?? 'localhost';
const redisPort = Number(process.env.REDIS_PORT ?? '6379');

const connection = {
  host: redisHost,
  port: redisPort,
};

/**
 * Fila principal de eventos de auditoria.
 * Jobs adicionados com retry policy e backoff exponencial.
 */
export const auditQueue = new Queue('audit-events', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s → 2s → 4s
    },
    removeOnComplete: { count: 100 }, // Mantém últimos 100 jobs completados
    removeOnFail: false, // Mantém jobs falhados para análise
  },
});

/**
 * Dead Letter Queue — recebe jobs que falharam após todas as tentativas.
 * Deve ser monitorada via dashboard (Bull Board) ou alertas.
 */
export const auditDlq = new Queue('audit-dlq', { connection });

/**
 * Worker principal: processa jobs da fila de auditoria.
 */
export const auditWorker = new Worker(
  'audit-events',
  async (job): Promise<void> => {
    await Promise.resolve(); // Garante async context para BullMQ
    logger.info({
      event: 'BULLMQ_JOB_PROCESSING',
      jobId: job.id,
      name: job.name,
      attempt: job.attemptsMade + 1,
      data: job.data,
    });
  },
  { connection }
);

auditWorker.on('completed', (job) => {
  logger.info({
    event: 'BULLMQ_JOB_COMPLETED',
    jobId: job.id,
    name: job.name,
  });
});

/**
 * Quando um job falha, verifica se esgotou as tentativas.
 * Se sim, move para DLQ para investigação manual.
 */
auditWorker.on('failed', (job, err) => {
  const maxAttempts = job?.opts.attempts ?? 3;
  const attemptsMade = job?.attemptsMade ?? 0;

  if (attemptsMade >= maxAttempts) {
    logger.error({
      event: 'BULLMQ_JOB_MOVED_TO_DLQ',
      jobId: job?.id,
      name: job?.name,
      attemptsMade,
      error: err.message,
    });

    // Move para DLQ de forma assíncrona
    if (job) {
      auditDlq
        .add(`dlq-${job.name}`, {
          originalJobId: job.id,
          originalData: job.data as Record<string, unknown>,
          failedAt: new Date().toISOString(),
          error: err.message,
          attemptsMade,
        })
        .catch((dlqErr: unknown) => {
          logger.error({
            event: 'BULLMQ_DLQ_ADD_FAILED',
            jobId: job.id,
            error: dlqErr,
          });
        });
    }
  } else {
    logger.warn({
      event: 'BULLMQ_JOB_RETRY_SCHEDULED',
      jobId: job?.id,
      name: job?.name,
      attemptsMade,
      maxAttempts,
      error: err.message,
    });
  }
});
