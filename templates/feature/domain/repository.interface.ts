// src/features/<feature>/domain/<entity>-repository.interface.ts

import { Entity } from './entity';

/**
 * Port (interface) do repositorio.
 * Define o contrato que a camada de infraestrutura deve implementar.
 */

export interface IEntityRepository {
  findById(id: string): Promise<Entity | null>;
  findAll(options: { page: number; limit: number }): Promise<Entity[]>;
  save(entity: Entity): Promise<void>;
  delete(id: string): Promise<void>;
}
