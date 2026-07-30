// src/features/__slug__/application/create-__slug__.ts

import { I__Name__Repository } from '../domain/__slug__-repository.interface';
import { __Name__ } from '../domain/__slug__';
import { Create__Name__Schema, Create__Name__Input } from './dto/create-__slug__.dto';
import { __Name__ResponseDTO, __Name__ResponseMapper } from './dto/__slug__-response.dto';
import { logger } from '@/shared/infrastructure/logger';

/** Use Case: cria um __Name__. Valida a entrada antes de acionar o dominio. */
export class Create__Name__UseCase {
  constructor(private readonly repository: I__Name__Repository) {}

  async execute(input: Create__Name__Input): Promise<__Name__ResponseDTO> {
    const dto = Create__Name__Schema.parse(input);
    logger.info({ event: 'CREATE___NAME___STARTED', name: dto.name });
    const entity = __Name__.create(dto);
    await this.repository.save(entity);
    logger.info({ event: 'CREATE___NAME___COMPLETED', id: entity.id });
    return __Name__ResponseMapper.fromDomain(entity);
  }
}
