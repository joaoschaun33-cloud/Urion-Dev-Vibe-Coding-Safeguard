import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

export interface RequestWithId extends Request {
  id?: string;
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  const reqId = (req.headers['x-request-id'] as string) || randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
}
