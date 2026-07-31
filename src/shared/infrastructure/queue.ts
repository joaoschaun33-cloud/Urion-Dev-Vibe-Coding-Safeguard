import { Queue, Worker } from 'bullmq';
import { logger } from '@/shared/infrastructure/logger';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT || 6379);

const connection = {
  host: redisHost,
  port: redisPort,
};

export const auditQueue = new Queue('audit-events', { connection });

export const auditWorker = new Worker(
  'audit-events',
  async (job) => {
    logger.info({
      event: 'BULLMQ_JOB_PROCESSED',
      jobId: job.id,
      name: job.name,
      data: job.data,
    });
  },
  { connection }
);

auditWorker.on('completed', (job) => {
  logger.info({ event: 'BULLMQ_JOB_COMPLETED', jobId: job.id });
});

auditWorker.on('failed', (job, err) => {
  logger.error({ event: 'BULLMQ_JOB_FAILED', jobId: job?.id, error: err.message });
});
