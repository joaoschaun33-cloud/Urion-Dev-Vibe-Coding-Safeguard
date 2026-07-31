/**
 * Outbox Poller — Garante consistência entre DB e filas de mensagens.
 *
 * Padrão Transactional Outbox: eventos são gravados na mesma transação
 * do DB e processados assincronamente por este poller, eliminando o risco
 * de perda de eventos em caso de falha entre o commit e o envio à fila.
 *
 * @see ADR-006 (Outbox Pattern)
 */

import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { DomainEventBus } from '@/shared/domain/domain-event-bus';
import { logger } from '@/shared/infrastructure/logger';

export interface OutboxPollerDeps {
  prisma: PrismaClient;
  queue: Queue;
  eventBus: DomainEventBus;
  pollIntervalMs?: number;
  batchSize?: number;
}

export class OutboxPoller {
  private readonly prisma: PrismaClient;
  private readonly queue: Queue;
  private readonly eventBus: DomainEventBus;
  private readonly pollIntervalMs: number;
  private readonly batchSize: number;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(deps: OutboxPollerDeps) {
    this.prisma = deps.prisma;
    this.queue = deps.queue;
    this.eventBus = deps.eventBus;
    this.pollIntervalMs = deps.pollIntervalMs ?? 5000;
    this.batchSize = deps.batchSize ?? 20;
  }

  /**
   * Inicia o polling periódico de eventos não processados.
   */
  start(): void {
    if (this.intervalHandle) {
      return; // Já iniciado
    }

    logger.info({
      event: 'OUTBOX_POLLER_STARTED',
      pollIntervalMs: this.pollIntervalMs,
      batchSize: this.batchSize,
    });

    this.intervalHandle = setInterval(() => {
      this.processOutbox().catch((err: unknown) => {
        logger.error({ event: 'OUTBOX_POLL_ERROR', error: err });
      });
    }, this.pollIntervalMs);
  }

  /**
   * Para o polling e limpa o intervalo.
   */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      logger.info({ event: 'OUTBOX_POLLER_STOPPED' });
    }
  }

  /**
   * Processa um lote de eventos pendentes no outbox.
   * Para cada evento:
   *   1. Publica no DomainEventBus (handlers in-process)
   *   2. Envia para BullMQ (processamento assíncrono)
   *   3. Marca como processado no DB
   *
   * Cada evento é processado individualmente para garantir idempotência.
   */
  async processOutbox(): Promise<number> {
    const pendingEvents = await this.prisma.outboxEvent.findMany({
      where: { processedAt: null },
      orderBy: { createdAt: 'asc' },
      take: this.batchSize,
    });

    if (pendingEvents.length === 0) {
      return 0;
    }

    let processedCount = 0;

    for (const event of pendingEvents) {
      try {
        const payload = event.payload as Record<string, unknown>;

        // 1. Publica no event bus in-process
        await this.eventBus.publish({
          eventName: event.eventName,
          occurredOn: event.createdAt,
          payload,
        });

        // 2. Envia para fila BullMQ
        await this.queue.add(event.eventName, {
          outboxEventId: event.id,
          ...payload,
        });

        // 3. Marca como processado
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { processedAt: new Date() },
        });

        processedCount++;

        logger.info({
          event: 'OUTBOX_EVENT_DISPATCHED',
          outboxEventId: event.id,
          eventName: event.eventName,
        });
      } catch (err: unknown) {
        // Evento individual falhou — será reprocessado no próximo poll
        logger.error({
          event: 'OUTBOX_EVENT_DISPATCH_FAILED',
          outboxEventId: event.id,
          eventName: event.eventName,
          error: err,
        });
      }
    }

    return processedCount;
  }
}
