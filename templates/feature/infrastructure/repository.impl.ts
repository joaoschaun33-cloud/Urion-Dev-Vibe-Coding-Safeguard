// src/features/__slug__/infrastructure/__slug__-repository.memory.ts

import { I__Name__Repository } from '../domain/__slug__-repository.interface';
import { __Name__ } from '../domain/__slug__';

/**
 * Repositorio EM MEMORIA (adapter padrao para comecar SEM banco).
 * A feature ja nasce compilando e testavel. Quando criar o modelo no
 * prisma/schema.prisma, troque por uma implementacao Prisma
 * (referencia: src/features/todo/infrastructure/todo-repository.prisma.ts).
 */
export class InMemory__Name__Repository implements I__Name__Repository {
  private readonly store = new Map<string, __Name__>();

  findById(id: string): Promise<__Name__ | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findAll({ page, limit }: { page: number; limit: number }): Promise<__Name__[]> {
    const all = [...this.store.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return Promise.resolve(all.slice((page - 1) * limit, (page - 1) * limit + limit));
  }

  save(entity: __Name__): Promise<void> {
    this.store.set(entity.id, entity);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }

  count(): Promise<number> {
    return Promise.resolve(this.store.size);
  }
}
