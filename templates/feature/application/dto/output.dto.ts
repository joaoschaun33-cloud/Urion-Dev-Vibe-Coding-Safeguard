// src/features/<feature>/application/dto/entity-response.dto.ts

import { Entity } from '../../domain/entity';

/**
 * DTO de saida: transforma entidade de dominio em resposta segura.
 * Nunca exponha a entidade diretamente.
 */

export interface EntityResponseDTO {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const EntityResponseDTO = {
  fromDomain(entity: Entity): EntityResponseDTO {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  },
};
