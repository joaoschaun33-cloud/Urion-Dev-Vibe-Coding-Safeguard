// src/app/middleware/error-handler.ts

import { Request, Response, NextFunction } from 'express';
import { DomainError } from '@/shared/errors';
import { ProblemDetails } from '@/shared/http/problem-details';
import { logger } from '@/shared/infrastructure/logger';

/**
 * Middleware global de tratamento de erros.
 * Converte erros de dominio em RFC 7807 Problem Details.
 */

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({
    event: 'REQUEST_ERROR',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err instanceof DomainError) {
    const problem = ProblemDetails.validationFailed(err);
    res.status(err.statusCode).json(problem);
    return;
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const problem = ProblemDetails.validationFailed(err);
    res.status(400).json(problem);
    return;
  }

  // Fallback: nunca exponha detalhes internos em producao
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message;

  res.status(500).json(ProblemDetails.internalError(message));
}
