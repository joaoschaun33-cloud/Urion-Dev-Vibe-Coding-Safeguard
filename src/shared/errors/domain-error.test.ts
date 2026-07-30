// src/shared/errors/domain-error.test.ts

import { describe, it, expect } from 'vitest';
import { DomainError } from './domain-error';

class SampleError extends DomainError {
  constructor() {
    super('SAMPLE', 'mensagem de exemplo');
  }
}

describe('DomainError (base)', () => {
  it('usa statusCode 400 por padrao e expoe code/name', () => {
    const err = new SampleError();
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('SAMPLE');
    expect(err.name).toBe('SampleError');
  });

  it('toJSON serializa code/message/statusCode', () => {
    const err = new SampleError();
    expect(err.toJSON()).toEqual({
      code: 'SAMPLE',
      message: 'mensagem de exemplo',
      statusCode: 400,
    });
  });
});
