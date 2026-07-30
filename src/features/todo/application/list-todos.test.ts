// src/features/todo/application/list-todos.test.ts

import { describe, it, expect, vi } from 'vitest';
import { ListTodosUseCase } from './list-todos';
import { ITodoRepository } from '../domain/todo-repository.interface';
import { Todo } from '../domain/todo';

const makeRepo = (): ITodoRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
});

describe('ListTodosUseCase', () => {
  it('mapeia dominio->DTO e calcula paginacao/hasNext', async () => {
    const repo = makeRepo();
    const todos = [Todo.create({ title: 'A' }), Todo.create({ title: 'B' })];
    vi.mocked(repo.findAll).mockResolvedValue(todos);
    vi.mocked(repo.count).mockResolvedValue(25);

    const result = await new ListTodosUseCase(repo).execute({ page: 1, limit: 10 });

    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result.total).toBe(25);
    expect(result.pages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.todos).toHaveLength(2);
    expect(typeof result.todos[0].createdAt).toBe('string');
  });

  it('hasNext=false na ultima pagina', async () => {
    const repo = makeRepo();
    vi.mocked(repo.findAll).mockResolvedValue([]);
    vi.mocked(repo.count).mockResolvedValue(5);

    const result = await new ListTodosUseCase(repo).execute({ page: 1, limit: 10 });

    expect(result.pages).toBe(1);
    expect(result.hasNext).toBe(false);
  });
});
