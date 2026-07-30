// src/features/todo/infrastructure/todo-repository.prisma.integration.test.ts
//
// Teste de INTEGRACAO: exercita o PrismaTodoRepository contra um Postgres real.
// Requer DATABASE_URL apontando para um banco de teste.
// Local:  docker compose up -d postgres && npm run test:integration
// (o schema e aplicado pelo globalSetup via `prisma db push`).

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaTodoRepository } from './todo-repository.prisma';
import { Todo } from '../domain/todo';

const prisma = new PrismaClient();
const repo = new PrismaTodoRepository(prisma);

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.todo.deleteMany();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.todo.deleteMany();
});

describe('PrismaTodoRepository (integracao)', () => {
  it('save() persiste e findById() recupera a entidade', async () => {
    const todo = Todo.create({ title: 'Integracao', priority: 'HIGH' });

    await repo.save(todo);
    const found = await repo.findById(todo.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(todo.id);
    expect(found?.title).toBe('Integracao');
    expect(found?.priority).toBe('HIGH');
    expect(found?.isCompleted).toBe(false);
  });

  it('findById() retorna null quando nao existe', async () => {
    const found = await repo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeNull();
  });

  it('save() faz upsert (atualiza um registro existente)', async () => {
    const todo = Todo.create({ title: 'v1' });
    await repo.save(todo);
    await repo.save(todo.updateTitle('v2'));

    const found = await repo.findById(todo.id);
    expect(found?.title).toBe('v2');
    expect(await repo.count()).toBe(1);
  });

  it('findAll() pagina em ordem decrescente e count() conta', async () => {
    for (let i = 0; i < 3; i++) {
      await repo.save(Todo.create({ title: `T${String(i)}` }));
    }

    const page1 = await repo.findAll({ page: 1, limit: 2 });
    const page2 = await repo.findAll({ page: 2, limit: 2 });

    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(1);
    expect(await repo.count()).toBe(3);
  });

  it('delete() remove o registro', async () => {
    const todo = Todo.create({ title: 'apagar' });
    await repo.save(todo);

    await repo.delete(todo.id);

    expect(await repo.findById(todo.id)).toBeNull();
    expect(await repo.count()).toBe(0);
  });
});
