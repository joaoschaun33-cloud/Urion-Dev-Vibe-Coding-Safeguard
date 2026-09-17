// src/shared/domain/scanner-verdict.test.ts
import { describe, it, expect } from 'vitest';
import { deriveStatus, COVERAGE_THRESHOLD } from './scanner-verdict';

describe('deriveStatus (anti-falso-verde)', () => {
  it('rebaixa para ATENCAO quando governanca alta mas cobertura baixa', () => {
    const v = deriveStatus({ healthScore: 100, estimatedCoveragePct: 18, criticalCount: 0 });
    expect(v.status).toBe('ATENCAO');
    expect(v.capped).toBe(true);
    expect(v.shielded).toBe(false);
    expect(v.reason).toContain('cobertura 18%');
  });

  it('permite EXCELENTE/blindado quando cobertura >= limite e sem criticos', () => {
    const v = deriveStatus({ healthScore: 100, estimatedCoveragePct: 85, criticalCount: 0 });
    expect(v.status).toBe('EXCELENTE');
    expect(v.shielded).toBe(true);
    expect(v.capped).toBe(false);
  });

  it('aceita cobertura exatamente no limite (80%)', () => {
    const v = deriveStatus({ healthScore: 95, estimatedCoveragePct: COVERAGE_THRESHOLD });
    expect(v.status).toBe('EXCELENTE');
    expect(v.shielded).toBe(true);
  });

  it('rebaixa quando ha problema critico mesmo com cobertura boa', () => {
    const v = deriveStatus({ healthScore: 100, estimatedCoveragePct: 90, criticalCount: 1 });
    expect(v.status).toBe('ATENCAO');
    expect(v.capped).toBe(true);
    expect(v.reason).toContain('critico');
  });

  it('nao eleva status baixo: governanca fraca continua CRITICO sem cap', () => {
    const v = deriveStatus({ healthScore: 40, estimatedCoveragePct: 10 });
    expect(v.status).toBe('CRITICO');
    expect(v.capped).toBe(false);
    expect(v.shielded).toBe(false);
  });

  it('BOM com cobertura baixa e rebaixado para ATENCAO', () => {
    const v = deriveStatus({ healthScore: 75, estimatedCoveragePct: 50 });
    expect(v.status).toBe('ATENCAO');
    expect(v.capped).toBe(true);
  });

  it('rebaixa quando cobertura nao foi medida, mesmo com numero alto ignorado', () => {
    const v = deriveStatus({
      healthScore: 100,
      estimatedCoveragePct: 999,
      coverageMeasured: false,
      criticalCount: 0,
    });
    expect(v.status).toBe('ATENCAO');
    expect(v.capped).toBe(true);
    expect(v.shielded).toBe(false);
    expect(v.reason).toContain('nao medida');
  });

  it('permite blindado quando cobertura foi medida de verdade e bate o limite', () => {
    const v = deriveStatus({
      healthScore: 100,
      estimatedCoveragePct: 85,
      coverageMeasured: true,
      criticalCount: 0,
    });
    expect(v.status).toBe('EXCELENTE');
    expect(v.shielded).toBe(true);
  });
});
