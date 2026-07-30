// src/features/todo/presentation/todo-controller.test.ts

import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { TodoController } from './todo-controller';
import { CreateTodoUseCase } from '../application/create-todo';
import { ListTodosUseCase } from '../application/list-todos';

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function makeController() {
  const createUseCase = { execute: vi.fn() } as unknown as CreateTodoUseCase;
  const listUseCase = { execute: vi.fn() } as unknown as ListTodosUseCase;
  const controller = new TodoController(createUseCase, listUseCase);
  return { controller, createUseCase, listUseCase };
}

describe('TodoController', () => {
  it('create() responde 201 com o resultado', async () => {
    const { controller, createUseCase } = makeController();
    const result = { id: '1', title: 'A', isCompleted: false, priority: 'MEDIUM' };
    vi.mocked(createUseCase.execute).mockResolvedValue(result as any);
    const req = { body: { title: 'A' }, path: '/todos' } as unknown as Request;
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('create() com body invalido responde 400 (Problem Details)', async () => {
    const { controller } = makeController();
    const req = { body: {}, path: '/todos' } as unknown as Request;
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 400, title: 'Validation Failed' }),
    );
  });

  it('create() relanca erro que nao seja de validacao', async () => {
    const { controller, createUseCase } = makeController();
    vi.mocked(createUseCase.execute).mockRejectedValue(new Error('boom'));
    const req = { body: { title: 'A' }, path: '/todos' } as unknown as Request;
    const res = mockRes();

    await expect(controller.create(req, res)).rejects.toThrow('boom');
  });

  it('list() usa defaults quando query vazia', async () => {
    const { controller, listUseCase } = makeController();
    vi.mocked(listUseCase.execute).mockResolvedValue({
      todos: [],
      total: 0,
      pages: 0,
      hasNext: false,
    } as any);
    const req = { query: {} } as unknown as Request;
    const res = mockRes();

    await controller.list(req, res);

    expect(listUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(res.json).toHaveBeenCalled();
  });

  it('list() respeita page/limit da query', async () => {
    const { controller, listUseCase } = makeController();
    vi.mocked(listUseCase.execute).mockResolvedValue({
      todos: [],
      total: 0,
      pages: 0,
      hasNext: false,
    } as any);
    const req = { query: { page: '3', limit: '50' } } as unknown as Request;
    const res = mockRes();

    await controller.list(req, res);

    expect(listUseCase.execute).toHaveBeenCalledWith({ page: 3, limit: 50 });
  });
});
