// src/shared/http/async-handler.test.ts

import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from './async-handler';

const flush = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe('asyncHandler', () => {
  it('encaminha rejeicoes para next(err)', async () => {
    const next = vi.fn();
    const handler = asyncHandler(() => Promise.reject(new Error('falhou')));
    handler({} as Request, {} as Response, next as unknown as NextFunction);
    await flush();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('nao chama next quando resolve', async () => {
    const next = vi.fn();
    const handler = asyncHandler(() => Promise.resolve('ok'));
    handler({} as Request, {} as Response, next as unknown as NextFunction);
    await flush();
    expect(next).not.toHaveBeenCalled();
  });

  it('suporta handler sincrono', async () => {
    const next = vi.fn();
    const handler = asyncHandler(() => undefined);
    handler({} as Request, {} as Response, next as unknown as NextFunction);
    await flush();
    expect(next).not.toHaveBeenCalled();
  });
});
