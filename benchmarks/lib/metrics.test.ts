import { describe, expect, it } from 'vitest';
import { confusion, f1, pct, pctWithInterval, precision, recall, sum, wilson } from './metrics';
import type { CaseOutcome } from './types';

const out = (id: string, expected: string[], fired: string[]): CaseOutcome => ({
  id,
  expected: new Set(expected),
  fired: new Set(fired),
});

describe('confusion', () => {
  const outcomes = [
    out('a', ['R'], ['R']), // TP
    out('b', ['R'], []), // FN
    out('c', [], ['R']), // FP
    out('d', [], []), // TN
    out('e', ['OTHER'], ['OTHER']), // irrelevante para R -> TN
  ];

  it('conta TP/FP/FN/TN por regra', () => {
    expect(confusion(outcomes, 'R')).toEqual({ tp: 1, fp: 1, fn: 1, tn: 2 });
  });

  it('sum agrega varias regras', () => {
    const total = sum([confusion(outcomes, 'R'), confusion(outcomes, 'OTHER')]);
    expect(total).toEqual({ tp: 2, fp: 1, fn: 1, tn: 6 });
  });
});

describe('precision / recall / f1', () => {
  it('calcula os valores esperados', () => {
    const c = { tp: 6, fp: 2, fn: 4, tn: 10 };
    expect(precision(c)).toBeCloseTo(0.75);
    expect(recall(c)).toBeCloseTo(0.6);
    expect(f1(c)).toBeCloseTo((2 * 0.75 * 0.6) / (0.75 + 0.6));
  });

  it('devolve null (nunca 0% ou 100%) quando indefinido', () => {
    expect(precision({ tp: 0, fp: 0, fn: 3, tn: 5 })).toBeNull();
    expect(recall({ tp: 0, fp: 2, fn: 0, tn: 5 })).toBeNull();
    expect(f1({ tp: 0, fp: 0, fn: 3, tn: 5 })).toBeNull();
  });

  it('f1 e 0 quando ha tp=0 mas precision e recall definidos', () => {
    expect(f1({ tp: 0, fp: 2, fn: 3, tn: 5 })).toBe(0);
  });
});

describe('wilson', () => {
  it('e largo com poucos casos e estreita com muitos', () => {
    const small = wilson(4, 5);
    const large = wilson(400, 500);
    expect(small).not.toBeNull();
    expect(large).not.toBeNull();
    const [sl, su] = small as [number, number];
    const [ll, lu] = large as [number, number];
    expect(su - sl).toBeGreaterThan(lu - ll);
  });

  it('valores de referencia conhecidos (8/10 -> ~49%..94%)', () => {
    const [lo, hi] = wilson(8, 10) as [number, number];
    expect(lo).toBeCloseTo(0.49, 1);
    expect(hi).toBeCloseTo(0.94, 1);
  });

  it('e null sem amostra e limitado a [0,1]', () => {
    expect(wilson(0, 0)).toBeNull();
    const [lo, hi] = wilson(5, 5) as [number, number];
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(1);
  });
});

describe('formatacao', () => {
  it('pct trata null', () => {
    expect(pct(null)).toBe('—');
    expect(pct(0.756)).toBe('76%');
  });

  it('pctWithInterval inclui a margem e trata amostra vazia', () => {
    expect(pctWithInterval(0, 0)).toBe('—');
    expect(pctWithInterval(8, 10)).toMatch(/^80% \(\d+–\d+%\)$/);
  });
});
