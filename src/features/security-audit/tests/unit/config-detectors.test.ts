// src/features/security-audit/tests/unit/config-detectors.test.ts
import { describe, it, expect } from 'vitest';
import { detectMissingRls } from '../../application/detect-missing-rls';
import { detectUnprotectedRoutes } from '../../application/detect-unprotected-routes';
import { detectEnvLeaks } from '../../application/detect-env-leaks';

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
