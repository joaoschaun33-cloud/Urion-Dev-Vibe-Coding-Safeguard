import { PrismaClient } from '@prisma/client';
import { ISecurityAuditRepository, SecurityAudit } from '../domain/security-audit';

export class PrismaSecurityAuditRepository implements ISecurityAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createWithTransaction(auditData: Omit<SecurityAudit, 'id' | 'createdAt'>): Promise<SecurityAudit> {
    // Uso obrigatorio de Transacoes Prisma para integridade
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.securityAuditLog.create({
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
    });
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
