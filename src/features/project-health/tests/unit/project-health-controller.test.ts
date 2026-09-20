import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { ProjectHealthController } from '../../presentation/project-health-controller';
import { createProjectHealthSchema } from '../../application/dto/create-project-health.dto';
import { ProjectHealthNotFoundError } from '../../domain/errors';
import { ProjectHealth } from '../../domain/project-health';
import type { CreateProjectHealthUseCase } from '../../application/create-project-health';
import type { IProjectHealthRepository } from '../../domain/project-health-repository.interface';

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function make() {
  const useCase = { execute: vi.fn() } as unknown as CreateProjectHealthUseCase;
  const repo = { findAll: vi.fn() } as unknown as IProjectHealthRepository;
  return { controller: new ProjectHealthController(useCase, repo), useCase, repo };
}

const metrics = { testsPassing: 10, totalTests: 10, mdcRulesActive: 5, architectureViolations: 0 };

describe('ProjectHealthController', () => {
  it('create() valida o body e responde 201', async () => {
    const { controller, useCase } = make();
    vi.mocked(useCase.execute).mockResolvedValue({ id: 'h1' } as never);
    const res = mockRes();

    await controller.create({ body: { projectName: 'p', metrics } } as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('create() rejeita body invalido', async () => {
    const { controller } = make();
    await expect(
      controller.create({ body: {} } as unknown as Request, mockRes())
    ).rejects.toThrow();
  });

  it('list() converte para DTO de resposta', async () => {
    const { controller, repo } = make();
    const health = ProjectHealth.create({ projectName: 'p', metrics });
    vi.mocked(repo.findAll).mockResolvedValue([health]);
    const res = mockRes();

    await controller.list({} as Request, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ projectName: 'p', score: 100, status: 'EXCELLENT' }),
    ]);
  });
});

describe('createProjectHealthSchema', () => {
  it('aceita metricas validas e rejeita negativas ou nome vazio', () => {
    expect(createProjectHealthSchema.safeParse({ projectName: 'p', metrics }).success).toBe(true);
    expect(
      createProjectHealthSchema.safeParse({
        projectName: 'p',
        metrics: { ...metrics, testsPassing: -1 },
      }).success
    ).toBe(false);
    expect(createProjectHealthSchema.safeParse({ projectName: '', metrics }).success).toBe(false);
  });
});

describe('ProjectHealth.create (dominio)', () => {
  it('rejeita nome vazio', () => {
    expect(() => ProjectHealth.create({ projectName: '  ', metrics })).toThrow(
      'Project name is required'
    );
  });

  it('classifica CRITICAL com violacoes arquiteturais e testes falhando', () => {
    const h = ProjectHealth.create({
      projectName: 'p',
      metrics: { testsPassing: 0, totalTests: 10, mdcRulesActive: 0, architectureViolations: 2 },
    });
    expect(h.status).toBe('CRITICAL');
    expect(h.score).toBeLessThan(50);
  });

  it('classifica WARNING e GOOD nas faixas intermediarias', () => {
    const warning = ProjectHealth.create({
      projectName: 'p',
      metrics: { testsPassing: 3, totalTests: 10, mdcRulesActive: 5, architectureViolations: 0 },
    });
    expect(warning.status).toBe('WARNING');
    const good = ProjectHealth.create({
      projectName: 'p',
      metrics: { testsPassing: 5, totalTests: 10, mdcRulesActive: 5, architectureViolations: 0 },
    });
    expect(good.status).toBe('GOOD');
  });

  it('restore() preserva id e datas', () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const h = ProjectHealth.restore({
      id: 'fixed',
      projectName: 'p',
      score: 90,
      status: 'EXCELLENT',
      metrics,
      createdAt,
    });
    expect(h.id).toBe('fixed');
    expect(h.createdAt).toBe(createdAt);
  });
});

describe('ProjectHealthNotFoundError', () => {
  it('tem codigo e status 404', () => {
    const err = new ProjectHealthNotFoundError('zzz');
    expect(err.code).toBe('PROJECT_HEALTH_NOT_FOUND');
    expect(err.statusCode).toBe(404);
  });
});
