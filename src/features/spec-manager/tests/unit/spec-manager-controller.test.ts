import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { SpecManagerController } from '../../presentation/spec-manager-controller';
import { createSpecDocumentSchema } from '../../application/dto/create-spec-manager.dto';
import { SpecManagerNotFoundError } from '../../domain/errors';
import type { CreateSpecDocumentUseCase } from '../../application/create-spec-manager';
import type { ISpecManagerRepository } from '../../domain/spec-manager-repository.interface';

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function make() {
  const useCase = {
    execute: vi.fn(),
    scanAndSync: vi.fn(),
  } as unknown as CreateSpecDocumentUseCase;
  const repo = { findAll: vi.fn() } as unknown as ISpecManagerRepository;
  return { controller: new SpecManagerController(useCase, repo), useCase, repo };
}

const body = { title: 'Spec', filePath: 'docs/spec.md', acceptanceCriteriaCount: 2 };

describe('SpecManagerController', () => {
  it('create() valida o body e responde 201', async () => {
    const { controller, useCase } = make();
    vi.mocked(useCase.execute).mockResolvedValue({ id: 's1' } as never);
    const res = mockRes();

    await controller.create({ body } as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 's1' });
  });

  it('create() rejeita body invalido', async () => {
    const { controller } = make();
    await expect(
      controller.create({ body: {} } as unknown as Request, mockRes())
    ).rejects.toThrow();
  });

  it('list() converte as specs para DTO de resposta', async () => {
    const { controller, repo } = make();
    const createdAt = new Date('2026-01-01T00:00:00Z');
    vi.mocked(repo.findAll).mockResolvedValue([
      {
        id: 's1',
        title: 'Spec',
        filePath: 'docs/spec.md',
        status: 'DRAFT',
        acceptanceCriteriaCount: 2,
        isValidated: false,
        createdAt,
      },
    ] as never);
    const res = mockRes();

    await controller.list({} as Request, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ id: 's1', createdAt: createdAt.toISOString() }),
    ]);
  });

  it('scan() devolve o resultado da sincronizacao', async () => {
    const { controller, useCase } = make();
    vi.mocked(useCase.scanAndSync).mockResolvedValue([{ id: 'x' }] as never);
    const res = mockRes();

    await controller.scan({} as Request, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 'x' }]);
  });
});

describe('createSpecDocumentSchema', () => {
  it('aceita body valido e rejeita contagem negativa ou titulo vazio', () => {
    expect(createSpecDocumentSchema.safeParse(body).success).toBe(true);
    expect(
      createSpecDocumentSchema.safeParse({ ...body, acceptanceCriteriaCount: -1 }).success
    ).toBe(false);
    expect(createSpecDocumentSchema.safeParse({ ...body, title: '' }).success).toBe(false);
  });
});

describe('SpecManagerNotFoundError', () => {
  it('tem codigo, status 404 e menciona o id', () => {
    const err = new SpecManagerNotFoundError('abc');
    expect(err.code).toBe('SPEC_MANAGER_NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('abc');
  });
});
