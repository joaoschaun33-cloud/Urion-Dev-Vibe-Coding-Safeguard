// src/features/__slug__/domain/__slug__-repository.interface.ts

import { __Name__ } from './__slug__';

/** Port do repositorio: contrato que a infraestrutura implementa. */
export interface I__Name__Repository {
  findById(id: string): Promise<__Name__ | null>;
  findAll(options: { page: number; limit: number }): Promise<__Name__[]>;
  save(entity: __Name__): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}
