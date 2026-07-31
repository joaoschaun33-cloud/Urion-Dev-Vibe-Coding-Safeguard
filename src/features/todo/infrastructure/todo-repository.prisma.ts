// src/features/todo/infrastructure/todo-repository.prisma.ts

import { ITodoRepository } from '../domain/todo-repository.interface';
import { Todo, TodoProps } from '../domain/todo';
import { PrismaClient } from '@prisma/client';

/**
 * Implementacao do repositorio com Prisma.
 */

export class PrismaTodoRepository implements ITodoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Todo | null> {
    const raw = await this.prisma.todo.findUnique({ where: { id } });
    return raw ? Todo.reconstitute(this.mapToProps(raw)) : null;
  }

  async findAll({ page, limit }: { page: number; limit: number }): Promise<Todo[]> {
    const raw = await this.prisma.todo.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return raw.map((r) => Todo.reconstitute(this.mapToProps(r)));
  }

  async findManyWithCursor({ cursor, limit }: { cursor?: string; limit: number }): Promise<Todo[]> {
    const raw = await this.prisma.todo.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });
    return raw.map((r) => Todo.reconstitute(this.mapToProps(r)));
  }

  async save(todo: Todo): Promise<void> {
    const data = todo.toJSON();
    await this.prisma.todo.upsert({
      where: { id: todo.id },
      update: {
        title: data.title,
        description: data.description,
        isCompleted: data.isCompleted,
        priority: data.priority,
        updatedAt: data.updatedAt,
      },
      create: {
        id: data.id,
        title: data.title,
        description: data.description,
        isCompleted: data.isCompleted,
        priority: data.priority,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.todo.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return this.prisma.todo.count();
  }

  private mapToProps(raw: Record<string, unknown>): TodoProps {
    return {
      id: raw.id as string,
      title: raw.title as string,
      description: raw.description as string | undefined,
      isCompleted: raw.isCompleted as boolean,
      priority: raw.priority as TodoProps['priority'],
      createdAt: raw.createdAt as Date,
      updatedAt: raw.updatedAt as Date,
    };
  }
}
