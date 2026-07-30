// src/features/<feature>/infrastructure/entity-repository.impl.ts

import { IEntityRepository } from '../domain/entity-repository.interface';
import { Entity, EntityProps } from '../domain/entity';
import { PrismaClient } from '@prisma/client';

/**
 * Implementacao do repositorio (Adapter).
 * Conhece detalhes de banco de dados.
 */

export class PrismaEntityRepository implements IEntityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Entity | null> {
    const raw = await this.prisma.entity.findUnique({ where: { id } });
    return raw ? Entity.reconstitute(raw as EntityProps) : null;
  }

  async findAll({ page, limit }: { page: number; limit: number }): Promise<Entity[]> {
    const raw = await this.prisma.entity.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return raw.map(r => Entity.reconstitute(r as EntityProps));
  }

  async save(entity: Entity): Promise<void> {
    await this.prisma.entity.upsert({
      where: { id: entity.id },
      update: { /* campos */ },
      create: { /* campos */ },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.entity.delete({ where: { id } });
  }
}
