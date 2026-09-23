import { describe, it, expect } from 'vitest';
import { evaluateLaunchGate, type LaunchGateInput } from './launch-gate';
import type { AuditEvaluation } from './audit-report';

const approvedReview: AuditEvaluation = {
  status: 'APPROVED',
  independent: true,
  sameModel: false,
  ageDays: 2,
  openBlocking: 0,
  problems: [],
  notes: [],
};

const ready: LaunchGateInput = {
  specs: [{ path: 'docs/specs/login.md', criteria: 3, completedCriteria: 3 }],
  coverage: { measured: true, pct: 85 },
  security: { criticalCount: 0 },
  review: approvedReview,
};

const ids = (r: ReturnType<typeof evaluateLaunchGate>) =>
  r.checks.filter((c) => !c.passed).map((c) => c.id);

describe('evaluateLaunchGate (roadmap 3.4)', () => {
  it('Grade A somente com spec + testes + seguranca + revisao', () => {
    const r = evaluateLaunchGate(ready);
    expect(r.grade).toBe('A');
    expect(r.ready).toBe(true);
    expect(r.blockers).toEqual([]);
  });

  it('sem spec com criterios => NOT_READY (SPEC)', () => {
    expect(ids(evaluateLaunchGate({ ...ready, specs: [] }))).toEqual(['SPEC']);
    expect(
      ids(
        evaluateLaunchGate({
          ...ready,
          specs: [{ path: 'x.md', criteria: 0, completedCriteria: 0 }],
        })
      )
    ).toEqual(['SPEC']);
  });

  it('criterios de aceite em aberto => NOT_READY e lista as specs', () => {
    const r = evaluateLaunchGate({
      ...ready,
      specs: [
        { path: 'docs/specs/a.md', criteria: 4, completedCriteria: 1 },
        { path: 'docs/specs/b.md', criteria: 2, completedCriteria: 2 },
      ],
    });
    expect(r.ready).toBe(false);
    expect(r.blockers[0]).toContain('docs/specs/a.md (1/4)');
    expect(r.blockers[0]).not.toContain('b.md');
  });

  it('cobertura nao medida => NOT_READY (nunca "ok por falta de dado")', () => {
    const r = evaluateLaunchGate({ ...ready, coverage: { measured: false, pct: null } });
    expect(ids(r)).toEqual(['TESTS']);
    expect(r.blockers[0]).toContain('nao medida');
  });

  it('cobertura abaixo do minimo => NOT_READY; no limite exato passa', () => {
    expect(ids(evaluateLaunchGate({ ...ready, coverage: { measured: true, pct: 79 } }))).toEqual([
      'TESTS',
    ]);
    expect(evaluateLaunchGate({ ...ready, coverage: { measured: true, pct: 80 } }).ready).toBe(
      true
    );
  });

  it('qualquer achado de seguranca critico => NOT_READY', () => {
    expect(ids(evaluateLaunchGate({ ...ready, security: { criticalCount: 2 } }))).toEqual([
      'SECURITY',
    ]);
  });

  it('sem auditoria => NOT_READY (REVIEW)', () => {
    expect(ids(evaluateLaunchGate({ ...ready, review: null }))).toEqual(['REVIEW']);
  });

  it('auditoria REJECTED ou INVALID => NOT_READY com o motivo', () => {
    const rejected: AuditEvaluation = {
      ...approvedReview,
      status: 'REJECTED',
      problems: ['ha 1 achado HIGH aberto'],
    };
    const r = evaluateLaunchGate({ ...ready, review: rejected });
    expect(ids(r)).toEqual(['REVIEW']);
    expect(r.blockers[0]).toContain('REJECTED');
    expect(r.blockers[0]).toContain('HIGH aberto');
  });

  it('auditoria em contexto compartilhado nao conta', () => {
    const r = evaluateLaunchGate({ ...ready, review: { ...approvedReview, independent: false } });
    expect(ids(r)).toEqual(['REVIEW']);
  });

  it('auditoria aprovada mas velha demais => NOT_READY', () => {
    const r = evaluateLaunchGate({ ...ready, review: { ...approvedReview, ageDays: 30 } });
    expect(ids(r)).toEqual(['REVIEW']);
    expect(r.blockers[0]).toContain('30 dias');
  });

  it('acumula todos os bloqueios', () => {
    const r = evaluateLaunchGate({
      specs: [],
      coverage: { measured: false, pct: null },
      security: { criticalCount: 1 },
      review: null,
    });
    expect(r.grade).toBe('NOT_READY');
    expect(r.blockers).toHaveLength(4);
  });

  it('respeita limiares customizados', () => {
    const r = evaluateLaunchGate({
      ...ready,
      coverage: { measured: true, pct: 60 },
      coverageThreshold: 50,
    });
    expect(r.ready).toBe(true);
  });

  it('inclui a observacao de modelo igual quando aprovado', () => {
    const r = evaluateLaunchGate({
      ...ready,
      review: { ...approvedReview, notes: ['mesmo modelo escreveu e auditou'] },
    });
    expect(r.ready).toBe(true);
    expect(r.checks.find((c) => c.id === 'REVIEW')?.detail).toContain('mesmo modelo');
  });
});
