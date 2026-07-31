import { describe, it, expect, vi } from 'vitest';
import { CreateSecurityAuditUseCase } from '../../application/create-security-audit';
import { ISecurityAuditRepository, SecurityAudit } from '../../domain/security-audit';

describe('CreateSecurityAuditUseCase', () => {
  it('deve criar uma auditoria de seguranca via transacao com sucesso', async () => {
    const mockAudit: SecurityAudit = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      targetSystem: 'Sibanki / Virtus Financeiro',
      severity: 'HIGH',
      findings: 2,
      status: 'PASSED',
      auditedBy: 'auditor@urion.ia.br',
      createdAt: new Date(),
    };

    const mockRepo: ISecurityAuditRepository = {
      createWithTransaction: vi.fn().mockResolvedValue(mockAudit),
      findAll: vi.fn().mockResolvedValue([mockAudit]),
    };

    const useCase = new CreateSecurityAuditUseCase(mockRepo);
    const result = await useCase.execute({
      targetSystem: 'Sibanki / Virtus Financeiro',
      severity: 'HIGH',
      findings: 2,
      status: 'PASSED',
      auditedBy: 'auditor@urion.ia.br',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(mockAudit.id);
    expect(mockRepo.createWithTransaction).toHaveBeenCalledOnce();
  });
});
