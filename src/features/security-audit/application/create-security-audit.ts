import { ISecurityAuditRepository, SecurityAudit } from '../domain/security-audit';
import { PrismaClient } from '@prisma/client';

export interface CreateSecurityAuditInput {
  targetSystem: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  findings: number;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  auditedBy: string;
}

/**
 * Use Case: Criar Auditoria de Segurança
 *
 * Implementa Transactional Outbox Pattern:
 * O evento de domínio é gravado na tabela `outbox_events` dentro da
 * mesma transação Prisma que cria o registro. O OutboxPoller consome
 * os eventos e despacha para BullMQ/DomainEventBus de forma segura.
 *
 * Isso garante atomicidade: se o DB commit falhar, o evento nunca é
 * publicado. Se o commit passar, o evento é garantido para ser processado.
 */
export class CreateSecurityAuditUseCase {
  constructor(
    private readonly securityAuditRepository: ISecurityAuditRepository,
    private readonly prisma: PrismaClient
  ) {}

  async execute(input: CreateSecurityAuditInput): Promise<SecurityAudit> {
    // Transação atômica: cria audit + grava evento no outbox
    const audit = await this.prisma.$transaction(async (tx) => {
      // 1. Persiste a entidade de auditoria
      const created = await this.securityAuditRepository.createInTransaction(tx, input);

      // 2. Grava evento no Outbox (mesma transação!)
      await tx.outboxEvent.create({
        data: {
          eventName: 'SecurityAuditCreated',
          payload: {
            auditId: created.id,
            targetSystem: created.targetSystem,
            severity: created.severity,
          },
        },
      });

      return created;
    });

    return audit;
  }
}
