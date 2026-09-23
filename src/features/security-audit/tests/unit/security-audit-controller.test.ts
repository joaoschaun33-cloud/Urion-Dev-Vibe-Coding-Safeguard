import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { SecurityAuditController } from '../../presentation/security-audit-controller';
import { createSecurityAuditSchema } from '../../presentation/security-audit-dto';
import { SecurityAuditSchema } from '../../domain/security-audit';
import type { CreateSecurityAuditUseCase } from '../../application/create-security-audit';
import type { ISecurityAuditRepository } from '../../domain/security-audit';

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function make() {
  const useCase = { execute: vi.fn() } as unknown as CreateSecurityAuditUseCase;
  const repo = { findAll: vi.fn() } as unknown as ISecurityAuditRepository;
  return { controller: new SecurityAuditController(useCase, repo), useCase, repo };
}

const validBody = {
  targetSystem: 'api',
  severity: 'HIGH',
  findings: 3,
  auditedBy: 'dev@example.com',
};

describe('SecurityAuditController', () => {
  it('create() valida o body e responde 201', async () => {
    const { controller, useCase } = make();
    vi.mocked(useCase.execute).mockResolvedValue({ id: 'a1' } as never);
    const res = mockRes();

    await controller.create({ body: validBody } as unknown as Request, res);

    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING' }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('create() rejeita body invalido (ZodError)', async () => {
    const { controller } = make();
    await expect(
      controller.create({ body: {} } as unknown as Request, mockRes())
    ).rejects.toThrow();
  });

  it('list() responde 200 com as auditorias', async () => {
    const { controller, repo } = make();
    vi.mocked(repo.findAll).mockResolvedValue([{ id: 'a1' }] as never);
    const res = mockRes();

    await controller.list({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 'a1' }]);
  });
});

describe('createSecurityAuditSchema', () => {
  it('usa PENDING como status padrao', () => {
    expect(createSecurityAuditSchema.parse(validBody).status).toBe('PENDING');
  });

  it('rejeita findings negativo, fracionario e severidade invalida', () => {
    expect(createSecurityAuditSchema.safeParse({ ...validBody, findings: -1 }).success).toBe(false);
    expect(createSecurityAuditSchema.safeParse({ ...validBody, findings: 1.5 }).success).toBe(
      false
    );
    expect(createSecurityAuditSchema.safeParse({ ...validBody, severity: 'X' }).success).toBe(
      false
    );
  });
});

describe('SecurityAuditSchema (dominio)', () => {
  const valid = {
    id: '11111111-1111-4111-8111-111111111111',
    targetSystem: 'api',
    severity: 'LOW',
    findings: 0,
    status: 'PASSED',
    auditedBy: 'dev@example.com',
    createdAt: new Date(),
  };

  it('aceita uma auditoria valida', () => {
    expect(SecurityAuditSchema.safeParse(valid).success).toBe(true);
  });

  it('exige uuid e e-mail validos', () => {
    expect(SecurityAuditSchema.safeParse({ ...valid, id: 'x' }).success).toBe(false);
    expect(SecurityAuditSchema.safeParse({ ...valid, auditedBy: 'nao-e-email' }).success).toBe(
      false
    );
  });
});
