// src/features/todo/tests/unit/create-todo.test.ts

import { describe, it, expect, vi } from 'vitest';
import { CreateTodoUseCase } from '../../application/create-todo';
import { ITodoRepository } from '../../domain/todo-repository.interface';

describe('CreateTodoUseCase', () => {
  const mockRepo: ITodoRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };

  const useCase = new CreateTodoUseCase(mockRepo);

  it('deve criar todo com dados validos', async () => {
    vi.mocked(mockRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute({
      title: 'Aprender FSD',
      description: 'Estudar Clean Architecture',
      priority: 'HIGH',
    });

    expect(result).toHaveProperty('id');
    expect(result.title).toBe('Aprender FSD');
    expect(result.priority).toBe('HIGH');
    expect(result.isCompleted).toBe(false);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);

    const savedEntity = vi.mocked(mockRepo.save).mock.calls[0][0];
    expect(savedEntity.title).toBe('Aprender FSD');
  });

  it('deve usar prioridade MEDIUM como padrao', async () => {
    vi.mocked(mockRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute({ title: 'Todo simples' });

    expect(result.priority).toBe('MEDIUM');
  });

  it('deve rejeitar entrada invalida (titulo vazio) sem persistir', async () => {
    vi.mocked(mockRepo.save).mockClear();

    await expect(useCase.execute({ title: '' })).rejects.toThrow();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
