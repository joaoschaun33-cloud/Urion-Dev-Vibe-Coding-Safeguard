// src/features/<feature>/tests/unit/create-entity.test.ts

import { describe, it, expect, vi } from 'vitest';
import { CreateEntityUseCase } from '../../application/create-entity';
import { IEntityRepository } from '../../domain/entity-repository.interface';
import { EntityAlreadyExistsError } from '../../domain/errors';

describe('CreateEntityUseCase', () => {
  const mockRepo: IEntityRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    findByUniqueField: vi.fn(),
  };

  const useCase = new CreateEntityUseCase(mockRepo);

  it('deve criar entidade quando dados sao validos', async () => {
    vi.mocked(mockRepo.findByUniqueField).mockResolvedValue(null);
    vi.mocked(mockRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute({
      name: 'Teste',
      email: 'teste@exemplo.com',
    });

    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Teste');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('deve lancar erro quando entidade ja existe', async () => {
    vi.mocked(mockRepo.findByUniqueField).mockResolvedValue({
      id: 'existing-id',
    } as any);

    await expect(useCase.execute({
      name: 'Teste',
      email: 'teste@exemplo.com',
    })).rejects.toThrow(EntityAlreadyExistsError);
  });
});
