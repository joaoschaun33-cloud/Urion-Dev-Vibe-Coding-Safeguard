// src/features/security-audit/tests/unit/config-detectors.test.ts
import { describe, it, expect } from 'vitest';
import { detectMissingRls } from '../../application/detect-missing-rls';
import { detectUnprotectedRoutes } from '../../application/detect-unprotected-routes';
import { detectEnvLeaks } from '../../application/detect-env-leaks';
import { detectUserIdFromClient } from '../../application/detect-userid-from-client';
import { detectSwallowedErrors } from '../../application/detect-swallowed-errors';
import { detectUnverifiedWebhook } from '../../application/detect-unverified-webhook';
import { detectUnvalidatedWrite } from '../../application/detect-unvalidated-write';

describe('detectMissingRls', () => {
  it('flag tabela sem RLS', () => {
    const f = detectMissingRls([
      { path: 'db/migr.sql', content: 'create table public.users (id int);' },
    ]);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('RLS_MISSING');
  });

  it('nao flag quando RLS habilitado (mesmo com schema diferente)', () => {
    const sql = 'create table public.users (id int);\nalter table users enable row level security;';
    expect(detectMissingRls([{ path: 'x.sql', content: sql }])).toHaveLength(0);
  });

  it('ignora create table em comentario', () => {
    const sql =
      '-- create table public.ghost (id int);\ncreate table public.a (id int);\nalter table a enable row level security;';
    expect(detectMissingRls([{ path: 'x.sql', content: sql }])).toHaveLength(0);
  });

  it('ignora arquivos nao-SQL', () => {
    expect(
      detectMissingRls([{ path: 'a.ts', content: 'create table users (id int);' }])
    ).toHaveLength(0);
  });
});

describe('detectUnprotectedRoutes', () => {
  it('flag rota sensivel sem auth', () => {
    const f = detectUnprotectedRoutes([
      { path: 'r.ts', content: "router.post('/admin/delete', handler);" },
    ]);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('ROUTE_NO_AUTH');
  });

  it('nao flag rota com middleware de auth', () => {
    const f = detectUnprotectedRoutes([
      { path: 'r.ts', content: "router.post('/admin', requireAuth, handler);" },
    ]);
    expect(f).toHaveLength(0);
  });

  it('nao flag rota marcada como publica', () => {
    const f = detectUnprotectedRoutes([
      { path: 'r.ts', content: "// PUBLIC: catalogo aberto\nrouter.get('/users/list', handler);" },
    ]);
    expect(f).toHaveLength(0);
  });

  it('nao flag rota nao-sensivel', () => {
    expect(
      detectUnprotectedRoutes([{ path: 'r.ts', content: "router.get('/health', handler);" }])
    ).toHaveLength(0);
  });

  it('flag rota sensivel num sub-router com nome customizado (achado de auditoria 2026-09-23)', () => {
    const f = detectUnprotectedRoutes([
      { path: 'r.ts', content: "adminRouter.post('/admin/delete', handler);" },
    ]);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('ROUTE_NO_AUTH');
  });
});

describe('detectEnvLeaks', () => {
  it('flag .env quando .gitignore nao cobre', () => {
    const f = detectEnvLeaks({ gitignore: 'node_modules\ndist\n', envFiles: ['.env'] });
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('ENV_NOT_IGNORED');
  });

  it('nao flag quando .gitignore cobre .env*', () => {
    expect(
      detectEnvLeaks({ gitignore: 'node_modules\n.env*\n', envFiles: ['.env', '.env.local'] })
    ).toHaveLength(0);
  });

  it('ignora .env.example', () => {
    expect(detectEnvLeaks({ gitignore: '', envFiles: ['.env.example'] })).toHaveLength(0);
  });
});

describe('detectUserIdFromClient (R2)', () => {
  it('flag userId lido direto de req.body', () => {
    const f = detectUserIdFromClient([
      { path: 'r.ts', content: 'const userId = req.body.userId;' },
    ]);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('USERID_FROM_CLIENT');
  });

  it('flag userId desestruturado de req.body', () => {
    const f = detectUserIdFromClient([
      { path: 'r.ts', content: 'const { userId, title } = req.body;' },
    ]);
    expect(f).toHaveLength(1);
  });

  it('nao flag userId vindo do usuario autenticado', () => {
    expect(
      detectUserIdFromClient([{ path: 'r.ts', content: 'const userId = req.user.id;' }])
    ).toHaveLength(0);
  });

  it('nao flag userId em query/params (fora do escopo, uso normal de REST)', () => {
    expect(
      detectUserIdFromClient([{ path: 'r.ts', content: 'const id = req.query.userId;' }])
    ).toHaveLength(0);
  });
});

describe('detectSwallowedErrors (R6)', () => {
  it('flag catch vazio com binding', () => {
    const f = detectSwallowedErrors([
      { path: 'r.ts', content: 'try { await gateway.charge(); } catch (e) {}' },
    ]);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('ERROR_SWALLOWED');
  });

  it('flag .catch(() => {}) de promise que faz I/O', () => {
    const f = detectSwallowedErrors([
      { path: 'r.ts', content: 'api.fetch("/orders").catch(() => {});' },
    ]);
    expect(f).toHaveLength(1);
  });

  it('escopo: catch vazio SEM I/O (chamada generica, audio, limpeza) nao e acusado', () => {
    // Medido em 70 repositorios nunca vistos: 6 de 7 achados assim eram falso alarme.
    expect(
      detectSwallowedErrors([{ path: 'r.ts', content: 'try { risky(); } catch (e) {}' }])
    ).toHaveLength(0);
    expect(
      detectSwallowedErrors([{ path: 'r.ts', content: 'doAsync().catch(() => {});' }])
    ).toHaveLength(0);
  });

  it('nao flag catch que trata o erro', () => {
    expect(
      detectSwallowedErrors([
        { path: 'r.ts', content: 'try { risky(); } catch (e) { logger.error(e); }' },
      ])
    ).toHaveLength(0);
  });
});

describe('detectUnverifiedWebhook (R9)', () => {
  it('flag webhook de pagamento sem verificacao de assinatura', () => {
    const f = detectUnverifiedWebhook([
      {
        path: 'r.ts',
        content: "router.post('/webhooks/stripe', (req, res) => {\n  res.sendStatus(200);\n});",
      },
    ]);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('WEBHOOK_UNVERIFIED');
  });

  it('nao flag quando verifica a assinatura', () => {
    expect(
      detectUnverifiedWebhook([
        {
          path: 'r.ts',
          content:
            "router.post('/webhooks/stripe', (req, res) => {\n  stripe.webhooks.constructEvent(req.body, sig, secret);\n});",
        },
      ])
    ).toHaveLength(0);
  });

  it('flag webhook com sub-router nomeado, sem verificacao (achado de auditoria 2026-09-23)', () => {
    const f = detectUnverifiedWebhook([
      {
        path: 'r.ts',
        content:
          "paymentsRouter.post('/webhook/stripe', (req, res) => {\n  const event = req.body;\n  res.status(200).send('ok');\n});",
      },
    ]);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('WEBHOOK_UNVERIFIED');
  });

  it('nao flag webhook sem relacao com pagamento', () => {
    expect(
      detectUnverifiedWebhook([
        { path: 'r.ts', content: "router.post('/webhooks/github', handler);" },
      ])
    ).toHaveLength(0);
  });
});

describe('detectUnvalidatedWrite (R7)', () => {
  it('flag data: req.body direto no create', () => {
    const f = detectUnvalidatedWrite([
      { path: 'r.ts', content: 'await prisma.user.create({ data: req.body });' },
    ]);
    expect(f).toHaveLength(1);
    expect(f[0].ruleId).toBe('BODY_UNVALIDATED_WRITE');
  });

  it('nao flag quando ha validacao no arquivo', () => {
    expect(
      detectUnvalidatedWrite([
        {
          path: 'r.ts',
          content:
            'const parsed = schema.parse(req.body);\nawait prisma.user.create({ data: req.body });',
        },
      ])
    ).toHaveLength(0);
  });

  it('nao flag quando so campos especificos sao usados', () => {
    expect(
      detectUnvalidatedWrite([
        { path: 'r.ts', content: 'await prisma.user.create({ data: { name: req.body.name } });' },
      ])
    ).toHaveLength(0);
  });
});
