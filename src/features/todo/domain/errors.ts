// src/features/todo/domain/errors.ts

import { DomainError } from '@/shared/errors';

export class TodoNotFoundError extends DomainError {
  constructor(todoId: string) {
    super('TODO_NOT_FOUND', `Todo com ID "${todoId}" nao encontrado.`, 404);
  }
}

export class TodoTitleEmptyError extends DomainError {
  constructor() {
    super('TODO_TITLE_EMPTY', 'O titulo do todo nao pode ser vazio.', 400);
  }
}

export class TodoAlreadyCompletedError extends DomainError {
  constructor(todoId: string) {
    super('TODO_ALREADY_COMPLETED', `Todo "${todoId}" ja esta completo.`, 409);
  }
}
