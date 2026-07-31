import { z } from 'zod';

export const SecurityAuditSchema = z.object({
  id: z.string().uuid(),
  targetSystem: z.string().min(2),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  findings: z.number().int().nonnegative(),
  status: z.enum(['PENDING', 'PASSED', 'FAILED']),
  auditedBy: z.string().email(),
  createdAt: z.date(),
});

export type SecurityAudit = z.infer<typeof SecurityAuditSchema>;

export interface ISecurityAuditRepository {
  createWithTransaction(audit: Omit<SecurityAudit, 'id' | 'createdAt'>): Promise<SecurityAudit>;
  /**
   * Cria auditoria dentro de uma transação externa (Outbox Pattern).
   * O tipo `tx` é genérico para evitar dependência do @prisma/client na camada de domínio.
   * A camada de infraestrutura faz o cast para o tipo concreto do Prisma.
   */
  createInTransaction(
    tx: unknown,
    audit: Omit<SecurityAudit, 'id' | 'createdAt'>
  ): Promise<SecurityAudit>;
  findAll(): Promise<SecurityAudit[]>;
}
