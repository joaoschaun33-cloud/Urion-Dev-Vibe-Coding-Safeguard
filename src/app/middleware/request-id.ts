import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from '@/shared/infrastructure/logger';
import type { Logger } from 'pino';

export interface RequestWithId extends Request {
  id?: string;
  log?: Logger;
}

import { requestContext } from '@/shared/infrastructure/async-context';

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  const reqId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  req.id = reqId;
  req.log = logger.child({ reqId });
  res.setHeader('X-Request-ID', reqId);

  requestContext.run({ requestId: reqId }, () => {
    next();
  });
}
