// src/features/<feature>/domain/errors.ts

import { DomainError } from '@/shared/errors/domain-error';

/**
 * Erros especificos do dominio.
 * Cada erro deve ter um codigo unico e mensagem clara.
 */

export class EntityNotFoundError extends DomainError {
  constructor(entityId: string) {
    super('ENTITY_NOT_FOUND', `Entidade com ID "${entityId}" nao encontrada.`);
  }
}

export class EntityAlreadyExistsError extends DomainError {
  constructor(identifier: string) {
    super('ENTITY_ALREADY_EXISTS', `Entidade "${identifier}" ja existe.`);
  }
}

export class InvalidEntityStateError extends DomainError {
  constructor(reason: string) {
    super('INVALID_ENTITY_STATE', `Estado invalido: ${reason}`);
  }
}
