import type { CaseOutcome } from './types';

export interface Confusion {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

/** Matriz de confusao de UMA regra sobre todos os casos (granularidade: caso, nao linha). */
export function confusion(outcomes: readonly CaseOutcome[], rule: string): Confusion {
  const c: Confusion = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const o of outcomes) {
    const expected = o.expected.has(rule);
    const fired = o.fired.has(rule);
    if (expected && fired) {
      c.tp++;
    } else if (!expected && fired) {
      c.fp++;
    } else if (expected && !fired) {
      c.fn++;
    } else {
      c.tn++;
    }
  }
  return c;
}

export function sum(list: readonly Confusion[]): Confusion {
  return list.reduce(
    (a, c) => ({ tp: a.tp + c.tp, fp: a.fp + c.fp, fn: a.fn + c.fn, tn: a.tn + c.tn }),
    { tp: 0, fp: 0, fn: 0, tn: 0 }
  );
}

/** null quando indefinido (0/0) — nunca inventar 0% ou 100%. */
export function precision(c: Confusion): number | null {
  return c.tp + c.fp === 0 ? null : c.tp / (c.tp + c.fp);
}

export function recall(c: Confusion): number | null {
  return c.tp + c.fn === 0 ? null : c.tp / (c.tp + c.fn);
}

export function f1(c: Confusion): number | null {
  const p = precision(c);
  const r = recall(c);
  if (p === null || r === null || p + r === 0) {
    return p === null || r === null ? null : 0;
  }
  return (2 * p * r) / (p + r);
}

/** Intervalo de confianca de Wilson (95%) para uma proporcao. Com poucos casos e largo — e deve ser. */
export function wilson(successes: number, total: number, z = 1.96): [number, number] | null {
  if (total === 0) {
    return null;
  }
  const p = successes / total;
  const z2 = z * z;
  const denom = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denom;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

export function pct(v: number | null): string {
  return v === null ? '—' : `${String(Math.round(v * 100))}%`;
}

export function pctWithInterval(successes: number, total: number): string {
  if (total === 0) {
    return '—';
  }
  const ci = wilson(successes, total);
  const point = Math.round((successes / total) * 100);
  return ci
    ? `${String(point)}% (${String(Math.round(ci[0] * 100))}–${String(Math.round(ci[1] * 100))}%)`
    : `${String(point)}%`;
}
