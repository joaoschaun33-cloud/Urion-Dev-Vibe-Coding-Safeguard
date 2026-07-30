// src/shared/http/async-handler.ts

import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Envolve handlers (sync ou async) garantindo que rejeicoes de Promise
 * sejam encaminhadas ao middleware de erro via next(err).
 *
 * Corrige o comportamento do Express 4, onde erros lancados em handlers
 * async NAO chegam automaticamente ao errorHandler global.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler =>
  (req, res, next): void => {
    Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
      next(err);
    });
  };
