// src/features/spec-manager/domain/errors.ts

import { DomainError } from '@/shared/errors';

export class SpecManagerNotFoundError extends DomainError {
  constructor(id: string) {
    super('SPEC_MANAGER_NOT_FOUND', `SpecManager com ID "${id}" nao encontrado.`, 404);
  }
}
