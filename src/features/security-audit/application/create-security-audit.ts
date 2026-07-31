import { ISecurityAuditRepository, SecurityAudit } from '../domain/security-audit';
import { domainEventBus } from '@/shared/domain/domain-event-bus';
import { auditQueue } from '@/shared/infrastructure/queue';

export interface CreateSecurityAuditInput {
  targetSystem: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  findings: number;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  auditedBy: string;
}

export class CreateSecurityAuditUseCase {
  constructor(private readonly securityAuditRepository: ISecurityAuditRepository) {}

  async execute(input: CreateSecurityAuditInput): Promise<SecurityAudit> {
    // Executa persistência em transação Prisma
    const audit = await this.securityAuditRepository.createWithTransaction(input);

    // Dispara Evento de Domínio Assíncrono
    await domainEventBus.publish({
      eventName: 'SecurityAuditCreated',
      occurredOn: new Date(),
      payload: { auditId: audit.id, targetSystem: audit.targetSystem },
    });

    // Enfileira processamento pesado no Redis via BullMQ Worker
    if (process.env.NODE_ENV !== 'test') {
      try {
        await auditQueue.add('process-audit-report', {
          auditId: audit.id,
          severity: audit.severity,
        });
      } catch {
        // Ignora erro de enfileiramento caso Redis não esteja ativo no ambiente local
      }
    }

    return audit;
  }
}
