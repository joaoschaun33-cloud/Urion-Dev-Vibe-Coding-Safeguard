import { describe, it, expect, vi } from 'vitest';
import { CreateSecurityAuditUseCase } from '../../application/create-security-audit';
import { ISecurityAuditRepository, SecurityAudit } from '../../domain/security-audit';

describe('CreateSecurityAuditUseCase', () => {
  it('deve criar uma auditoria de seguranca via Outbox Pattern com sucesso', async () => {
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
      createInTransaction: vi.fn().mockResolvedValue(mockAudit),
      findAll: vi.fn().mockResolvedValue([mockAudit]),
    };

    // Mock do PrismaClient.$transaction que executa o callback
    const mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
        // Simula transação: o tx contém outboxEvent.create
        const tx = {
          outboxEvent: {
            create: vi.fn().mockResolvedValue({ id: 'outbox-1' }),
          },
        };
        return cb(tx);
      }),
    };

    const useCase = new CreateSecurityAuditUseCase(mockRepo, mockPrisma as never);

    const result = await useCase.execute({
      targetSystem: 'Sibanki / Virtus Financeiro',
      severity: 'HIGH',
      findings: 2,
      status: 'PASSED',
      auditedBy: 'auditor@urion.ia.br',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(mockAudit.id);
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    expect(mockRepo.createInTransaction).toHaveBeenCalledOnce();
  });

  it('deve reverter a transacao se a criacao falhar', async () => {
    const mockRepo: ISecurityAuditRepository = {
      createWithTransaction: vi.fn(),
      createInTransaction: vi.fn().mockRejectedValue(new Error('DB Error')),
      findAll: vi.fn(),
    };

    const mockPrisma = {
      $transaction: vi.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          outboxEvent: { create: vi.fn() },
        };
        return cb(tx);
      }),
    };

    const useCase = new CreateSecurityAuditUseCase(mockRepo, mockPrisma as never);

    await expect(
      useCase.execute({
        targetSystem: 'Sistema Teste',
        severity: 'LOW',
        findings: 0,
        status: 'PENDING',
        auditedBy: 'test@urion.ia.br',
      })
    ).rejects.toThrow('DB Error');
  });
});
