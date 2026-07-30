// src/features/<feature>/application/<action>-<entity>.ts

import { IEntityRepository } from '../domain/entity-repository.interface';
import { Entity } from '../domain/entity';
import { EntityAlreadyExistsError } from '../domain/errors';
import { CreateEntityDTO } from './dto/create-entity.dto';
import { EntityResponseDTO } from './dto/entity-response.dto';

/**
 * Use Case: Acao de aplicacao que orquestra a logica de negocio.
 * Puro: nao conhece HTTP, banco, ou frameworks.
 */

export class CreateEntityUseCase {
  constructor(private readonly repository: IEntityRepository) {}

  async execute(dto: CreateEntityDTO): Promise<EntityResponseDTO> {
    // 1. Verificar unicidade (regra de negocio)
    const existing = await this.repository.findByUniqueField(dto.uniqueField);
    if (existing) {
      throw new EntityAlreadyExistsError(dto.uniqueField);
    }

    // 2. Criar entidade de dominio
    const entity = Entity.create(dto);

    // 3. Persistir
    await this.repository.save(entity);

    // 4. Retornar DTO de resposta
    return EntityResponseDTO.fromDomain(entity);
  }
}
