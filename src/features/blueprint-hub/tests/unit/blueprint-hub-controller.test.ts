import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { BlueprintHubController } from '../../presentation/blueprint-hub-controller';
import type { CreateBlueprintUseCase } from '../../application/create-blueprint';
import type { IBlueprintHubRepository } from '../../domain/blueprint-hub-repository.interface';

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function make() {
  const useCase = { execute: vi.fn() } as unknown as CreateBlueprintUseCase;
  const repo = {
    findById: vi.fn(),
    listRecent: vi.fn(),
  } as unknown as IBlueprintHubRepository;
  return { controller: new BlueprintHubController(useCase, repo), useCase, repo };
}

describe('BlueprintHubController', () => {
  it('create() responde 201 com o resultado do use case', async () => {
    const { controller, useCase } = make();
    vi.mocked(useCase.execute).mockResolvedValue({ id: 'b1' } as never);
    const res = mockRes();

    await controller.create({ body: { title: 'x' } } as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 'b1' });
  });

  it('getById() responde 200 quando encontra', async () => {
    const { controller, repo } = make();
    vi.mocked(repo.findById).mockResolvedValue({ id: 'b1' } as never);
    const res = mockRes();

    await controller.getById({ params: { id: 'b1' } } as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'b1' } });
  });

  it('getById() responde 404 (problem details) quando nao encontra', async () => {
    const { controller, repo } = make();
    vi.mocked(repo.findById).mockResolvedValue(null as never);
    const res = mockRes();

    await controller.getById({ params: { id: 'nope' } } as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const body = vi.mocked(res.json).mock.calls[0][0] as { status: number; detail: string };
    expect(body.status).toBe(404);
    expect(body.detail).toContain('nope');
  });

  it('list() responde 200 com total e dados', async () => {
    const { controller, repo } = make();
    vi.mocked(repo.listRecent).mockResolvedValue([{ id: 'a' }, { id: 'b' }] as never);
    const res = mockRes();

    await controller.list({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      total: 2,
      data: [{ id: 'a' }, { id: 'b' }],
    });
  });
});
