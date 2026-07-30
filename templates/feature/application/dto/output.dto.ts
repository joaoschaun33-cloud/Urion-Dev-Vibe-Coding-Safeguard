// src/features/__slug__/application/dto/__slug__-response.dto.ts

import { __Name__ } from '../../domain/__slug__';

export interface __Name__ResponseDTO {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const __Name__ResponseMapper = {
  fromDomain(entity: __Name__): __Name__ResponseDTO {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  },
  fromDomainList(items: __Name__[]): __Name__ResponseDTO[] {
    return items.map((e) => __Name__ResponseMapper.fromDomain(e));
  },
};
