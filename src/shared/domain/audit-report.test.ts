import { describe, it, expect } from 'vitest';
import { evaluateAuditReport } from './audit-report';

const NOW = new Date('2026-09-19T12:00:00Z');

const finding = {
  severity: 'HIGH',
  claim: 'Rota /users sem autenticacao expoe dados',
  file: 'src/routes.ts',
  line: 12,
  evidence: "router.get('/users', handler)",
  status: 'OPEN',
};

const base = {
  reviewer: 'auditor-agent',
  model: 'modelo-b',
  authorModel: 'modelo-a',
  contextIsolation: 'fresh',
  reviewedAt: '2026-09-18T12:00:00Z',
  scope: 'PR #12 (main..feature/login)',
  verdict: 'APPROVED',
  findings: [],
};

describe('evaluateAuditReport (roadmap 3.5)', () => {
  it('APPROVED valido, independente e com idade calculada', () => {
    const r = evaluateAuditReport(base, NOW);
    expect(r.status).toBe('APPROVED');
    expect(r.independent).toBe(true);
    expect(r.sameModel).toBe(false);
    expect(r.ageDays).toBeCloseTo(1, 1);
    expect(r.problems).toEqual([]);
  });

  it('BLOQUEIA: APPROVED que contradiz achado CRITICAL/HIGH aberto vira REJECTED', () => {
    const r = evaluateAuditReport({ ...base, findings: [finding] }, NOW);
    expect(r.status).toBe('REJECTED');
    expect(r.openBlocking).toBe(1);
    expect(r.problems[0]).toContain('o auditor bloqueia');
  });

  it('achado HIGH RESOLVIDO (com resolution) nao bloqueia', () => {
    const resolved = {
      ...finding,
      status: 'RESOLVED',
      resolution: 'Adicionado middleware requireAuth',
    };
    expect(evaluateAuditReport({ ...base, findings: [resolved] }, NOW).status).toBe('APPROVED');
  });

  it('achado MEDIUM/LOW aberto nao bloqueia o APPROVED', () => {
    const medium = { ...finding, severity: 'MEDIUM' };
    const r = evaluateAuditReport({ ...base, findings: [medium] }, NOW);
    expect(r.status).toBe('APPROVED');
    expect(r.openBlocking).toBe(0);
  });

  it('EXIGE EVIDENCIA: achado sem trecho de codigo citado torna o relatorio INVALID', () => {
    const r = evaluateAuditReport({ ...base, findings: [{ ...finding, evidence: '' }] }, NOW);
    expect(r.status).toBe('INVALID');
    expect(r.problems.join(' ')).toContain('evidence');
  });

  it('RESOLVED sem resolution e INVALID', () => {
    const r = evaluateAuditReport({ ...base, findings: [{ ...finding, status: 'RESOLVED' }] }, NOW);
    expect(r.status).toBe('INVALID');
    expect(r.problems.join(' ')).toContain('resolution');
  });

  it('veredito REJECTED declarado e respeitado', () => {
    expect(evaluateAuditReport({ ...base, verdict: 'REJECTED' }, NOW).status).toBe('REJECTED');
  });

  it('contexto compartilhado nao conta como independente (e avisa)', () => {
    const r = evaluateAuditReport({ ...base, contextIsolation: 'shared' }, NOW);
    expect(r.independent).toBe(false);
    expect(r.notes.join(' ')).toContain('independente');
  });

  it('mesmo modelo escreveu e auditou: nota de independencia reduzida', () => {
    const r = evaluateAuditReport({ ...base, model: 'Modelo-A', authorModel: 'modelo-a' }, NOW);
    expect(r.sameModel).toBe(true);
    expect(r.notes.join(' ')).toContain('mesmo modelo');
  });

  it('data no futuro e INVALID', () => {
    const r = evaluateAuditReport({ ...base, reviewedAt: '2026-12-01T00:00:00Z' }, NOW);
    expect(r.status).toBe('INVALID');
    expect(r.problems.join(' ')).toContain('futuro');
  });

  it('lixo (nao-objeto, campos ausentes, data invalida) e INVALID', () => {
    expect(evaluateAuditReport('texto', NOW).status).toBe('INVALID');
    expect(evaluateAuditReport({}, NOW).status).toBe('INVALID');
    expect(evaluateAuditReport({ ...base, reviewedAt: 'ontem' }, NOW).status).toBe('INVALID');
  });
});

describe('templates/audit-report.example.json', () => {
  it('continua valido contra o schema (evita drift entre o exemplo e o validador)', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const raw: unknown = JSON.parse(
      readFileSync(resolve(process.cwd(), 'templates/audit-report.example.json'), 'utf8')
    );
    const r = evaluateAuditReport(raw, new Date('2026-09-20T00:00:00Z'));
    expect(r.status).not.toBe('INVALID');
    expect(r.problems).toEqual([]);
  });
});
