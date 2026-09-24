import { describe, expect, it } from 'vitest';
import { isTestOrFixturePath } from '../../src/features/security-audit/domain/scan-filters';
import { checksCases } from '../fixtures/checks';
import { vibeguardCases } from '../fixtures/vibeguard';
import { runEnginesOnFiles } from './engines';
import { CHECKS_RULES, VIBEGUARD_RULES } from './types';

const cases = [...vibeguardCases, ...checksCases];
// Pastas que os scanners pulam de proposito (walkers do vibeguard e do config gate).
const IGNORED_SEGMENTS = new Set(['node_modules', '.git', 'dist', 'build', '.urion', '.next', 'coverage', 'web']);

describe('integridade do corpus', () => {
  it('ids sao unicos e todo caso tem justificativa', () => {
    const ids = cases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of cases) {
      expect(c.why.trim().length, c.id).toBeGreaterThan(10);
    }
  });

  it('so referencia regras que existem', () => {
    for (const c of cases) {
      for (const r of c.expect.vibeguard ?? []) {
        expect(VIBEGUARD_RULES as readonly string[], c.id).toContain(r);
      }
      for (const r of c.expect.checks ?? []) {
        expect(CHECKS_RULES as readonly string[], c.id).toContain(r);
      }
    }
  });

  it('nenhum arquivo do corpus cai num filtro que o scanner ignora (senao viraria falso "perdeu")', () => {
    // Casos SEGUROS cujo objetivo e justamente testar o filtro de arquivos de teste.
    const testsTheFilter = new Set(['sec-n06-fake-secret-in-test']);
    for (const c of cases) {
      for (const p of Object.keys(c.files)) {
        if (testsTheFilter.has(c.id)) {
          expect(Object.values(c.expect).flat(), `${c.id} deve ser um caso seguro`).toEqual([]);
          continue;
        }
        expect(isTestOrFixturePath(p), `${c.id}: ${p} parece teste/fixture`).toBe(false);
        const hit = p.split('/').find((seg) => IGNORED_SEGMENTS.has(seg));
        expect(hit, `${c.id}: ${p} usa pasta ignorada (${String(hit)})`).toBeUndefined();
      }
    }
  });

  it('cada regra tem casos vulneraveis E seguros (senao nao ha como medir precisao)', () => {
    for (const rule of [...VIBEGUARD_RULES, ...CHECKS_RULES]) {
      const positives = cases.filter(
        (c) => (c.expect.vibeguard as string[] | undefined)?.includes(rule) || (c.expect.checks as string[] | undefined)?.includes(rule)
      );
      expect(positives.length, `${rule}: casos vulneraveis`).toBeGreaterThanOrEqual(6);
    }
    const safe = cases.filter((c) => Object.keys(c.expect).every((k) => (c.expect[k as 'vibeguard' | 'checks'] ?? []).length === 0));
    expect(safe.length).toBeGreaterThanOrEqual(30);
  });
});

describe('o medidor exercita os motores de verdade', () => {
  const stripe = ['sk_', 'live_', '51Nq8ZbLkD3fA9xT7VwY2cRe'].join('');

  it('detecta um segredo obvio pelo motor vibeguard e fica quieto no codigo limpo', () => {
    const bad = runEnginesOnFiles({ 'src/a.ts': `const k = new Stripe('${stripe}');` });
    const good = runEnginesOnFiles({ 'src/a.ts': 'const k = new Stripe(process.env.STRIPE_SECRET_KEY);' });
    expect([...bad.vibeguard]).toContain('SECRETS_HARDCODED');
    expect([...good.vibeguard]).toEqual([]);
  });

  it('detecta tabela sem RLS pelo motor checks', () => {
    // Layout do Supabase CLI: o detector so acusa RLS quando ha evidencia de Supabase.
    const r = runEnginesOnFiles({ 'supabase/migrations/1_init.sql': 'create table public.t (id int);' });
    expect([...r.checks]).toContain('RLS_MISSING');
    const plain = runEnginesOnFiles({ 'db/m.sql': 'create table public.t (id int);' });
    expect([...plain.checks]).not.toContain('RLS_MISSING');
  });

  it('o mesmo segredo sob "fixtures/" e IGNORADO — por isso o corpus e checado acima', () => {
    const r = runEnginesOnFiles({ 'fixtures/a.ts': `const k = new Stripe('${stripe}');` });
    expect([...r.vibeguard]).toEqual([]);
  });
});
