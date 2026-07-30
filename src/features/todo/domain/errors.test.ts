// src/features/todo/domain/errors.test.ts

import { describe, it, expect } from 'vitest';
import {
  TodoNotFoundError,
  TodoTitleEmptyError,
  TodoAlreadyCompletedError,
} from './errors';
import { DomainError } from '@/shared/errors';

describe('Erros de dominio do Todo', () => {
  it('TodoNotFoundError: 404 + code + id na mensagem', () => {
    const err = new TodoNotFoundError('abc');
    expect(err).toBeInstanceOf(DomainError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('TODO_NOT_FOUND');
    expect(err.message).toContain('abc');
  });

  it('TodoTitleEmptyError: 400', () => {
    const err = new TodoTitleEmptyError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('TODO_TITLE_EMPTY');
  });

  it('TodoAlreadyCompletedError: 409', () => {
    const err = new TodoAlreadyCompletedError('id1');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('TODO_ALREADY_COMPLETED');
    expect(err.message).toContain('id1');
  });
});
