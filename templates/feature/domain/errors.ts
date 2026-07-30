// src/features/__slug__/domain/errors.ts

import { DomainError } from '@/shared/errors';

export class __Name__NotFoundError extends DomainError {
  constructor(id: string) {
    super('__NAME___NOT_FOUND', `__Name__ com ID "${id}" nao encontrado.`, 404);
  }
}
