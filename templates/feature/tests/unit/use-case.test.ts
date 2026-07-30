// src/features/__slug__/tests/unit/create-__slug__.test.ts

import { describe, it, expect } from 'vitest';
import { Create__Name__UseCase } from '../../application/create-__slug__';
import { InMemory__Name__Repository } from '../../infrastructure/__slug__-repository.memory';

describe('Create__Name__UseCase', () => {
  it('cria e persiste com dados validos', async () => {
    const repo = new InMemory__Name__Repository();
    const useCase = new Create__Name__UseCase(repo);

    const result = await useCase.execute({ name: 'Exemplo' });

    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Exemplo');
    expect(await repo.count()).toBe(1);
  });

  it('rejeita entrada invalida (name vazio)', async () => {
    const repo = new InMemory__Name__Repository();
    const useCase = new Create__Name__UseCase(repo);

    await expect(useCase.execute({ name: '' })).rejects.toThrow();
    expect(await repo.count()).toBe(0);
  });
});
