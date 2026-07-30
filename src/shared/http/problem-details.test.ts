// src/shared/http/problem-details.test.ts

import { describe, it, expect } from 'vitest';
import { ProblemDetails } from './problem-details';

describe('ProblemDetails (RFC 7807)', () => {
  it('validationFailed -> 400 com detail e instance', () => {
    const p = ProblemDetails.validationFailed(new Error('invalido'), '/x');
    expect(p).toMatchObject({
      status: 400,
      title: 'Validation Failed',
      detail: 'invalido',
      instance: '/x',
    });
  });

  it('notFound -> 404', () => {
    expect(ProblemDetails.notFound(new Error('nao achou')).status).toBe(404);
  });

  it('unauthorized -> 401', () => {
    expect(ProblemDetails.unauthorized(new Error('sem acesso')).status).toBe(401);
  });

  it('internalError -> 500', () => {
    const p = ProblemDetails.internalError('erro interno');
    expect(p.status).toBe(500);
    expect(p.detail).toBe('erro interno');
  });
});
