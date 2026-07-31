import { z } from 'zod';

export const createSecurityAuditSchema = z.object({
  targetSystem: z.string().min(1, 'Target system is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  findings: z.number().int().min(0, 'Findings must be a non-negative integer'),
  status: z.enum(['PENDING', 'PASSED', 'FAILED']).default('PENDING'),
  auditedBy: z.string().min(1, 'Audited by is required'),
});

export type CreateSecurityAuditDTO = z.infer<typeof createSecurityAuditSchema>;
