import { describe, it, expect } from 'vitest';
import { tenantMiddleware } from '../tenant-middleware';
import { listCommunityRules } from '@/shared/infrastructure/marketplace/community-rules';
import { Request, Response } from 'express';

describe('Multi-Tenant & Marketplace de Regras', () => {
  it('deve extrair o Tenant ID do cabeçalho da requisição', () => {
    const req = {
      headers: {
        'x-tenant-id': 'tenant-enterprise-123',
        'x-tenant-slug': 'acme-corp',
      },
    } as unknown as Request;

    const res = {} as Response;
    let nextCalled = false;

    tenantMiddleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.tenant?.tenantId).toBe('tenant-enterprise-123');
    expect(req.tenant?.tenantSlug).toBe('acme-corp');
  });

  it('deve listar regras comunitárias de LGPD e HIPAA do Marketplace', () => {
    const lgpdRules = listCommunityRules('LGPD');

    expect(lgpdRules.length).toBeGreaterThan(0);
    expect(lgpdRules[0].ruleId).toBe('LGPD_CPF_EXPOSURE');
    expect(lgpdRules[0].category).toBe('LGPD');
  });
});
