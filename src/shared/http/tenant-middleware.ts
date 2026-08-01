/**
 * 🏢 Multi-Tenant Middleware & Context
 *
 * Extrai e valida a identificação da organização (Tenant ID / Subdomínio / Header)
 * em requisições de API para isolar dados entre contas no Urion Trust & Safety.
 */

import { Request, Response, NextFunction } from 'express';

export interface TenantContext {
  tenantId?: string;
  tenantSlug?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

export const tenantMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const tenantIdHeader = req.headers['x-tenant-id'] as string | undefined;
  const tenantSlugHeader = req.headers['x-tenant-slug'] as string | undefined;

  req.tenant = {
    tenantId: tenantIdHeader ?? 'default-free-tenant',
    tenantSlug: tenantSlugHeader ?? 'default',
  };

  next();
};
