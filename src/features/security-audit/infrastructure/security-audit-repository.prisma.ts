import { PrismaClient } from '@prisma/client';
import { ISecurityAuditRepository, SecurityAudit } from '../domain/security-audit';

/**
 * Tipo do Prisma Transaction Client gerado automaticamente.
 * Usado internamente na camada de infra para tipagem segura.
 */
type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export class PrismaSecurityAuditRepository implements ISecurityAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Cria auditoria em transação auto-contida (uso legado/direto).
   */
  async createWithTransaction(
    auditData: Omit<SecurityAudit, 'id' | 'createdAt'>
  ): Promise<SecurityAudit> {
    return this.prisma.$transaction(async (tx) => {
      return this.createInTransaction(tx, auditData);
    });
  }

  /**
   * Cria auditoria dentro de uma transação Prisma externa.
   * Usado pelo Outbox Pattern: o use case controla a transação
   * e grava o evento outbox na mesma transação.
   */
  async createInTransaction(
    tx: unknown,
    auditData: Omit<SecurityAudit, 'id' | 'createdAt'>
  ): Promise<SecurityAudit> {
    const prismaTx = tx as PrismaTransactionClient;

    const created = await prismaTx.securityAuditLog.create({
      data: {
        targetSystem: auditData.targetSystem,
        severity: auditData.severity,
        findings: auditData.findings,
        status: auditData.status,
        auditedBy: auditData.auditedBy,
      },
    });

    return {
      id: created.id,
      targetSystem: created.targetSystem,
      severity: created.severity as SecurityAudit['severity'],
      findings: created.findings,
      status: created.status as SecurityAudit['status'],
      auditedBy: created.auditedBy,
      createdAt: created.createdAt,
    };
  }

  async findAll(): Promise<SecurityAudit[]> {
    const logs = await this.prisma.securityAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      targetSystem: log.targetSystem,
      severity: log.severity as SecurityAudit['severity'],
      findings: log.findings,
      status: log.status as SecurityAudit['status'],
      auditedBy: log.auditedBy,
      createdAt: log.createdAt,
    }));
  }
}
