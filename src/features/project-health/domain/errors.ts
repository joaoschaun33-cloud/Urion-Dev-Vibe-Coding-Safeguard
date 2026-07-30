// src/features/project-health/domain/errors.ts

import { DomainError } from '@/shared/errors';

export class ProjectHealthNotFoundError extends DomainError {
  constructor(id: string) {
    super('PROJECT_HEALTH_NOT_FOUND', `ProjectHealth com ID "${id}" nao encontrado.`, 404);
  }
}
