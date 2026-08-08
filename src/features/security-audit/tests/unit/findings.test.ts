// src/features/security-audit/tests/unit/findings.test.ts
import { describe, it, expect } from 'vitest';
import { scoreFromFindings, type Finding } from '../../domain/findings';

const f = (severity: Finding['severity']): Finding => ({
  ruleId: 'X',
  severity,
  file: 'a.ts',
  message: 'm',
  remediation: 'r',
});

describe('scoreFromFindings', () => {
  it('retorna 100 sem findings', () => {
    expect(scoreFromFindings([])).toBe(100);
  });

  it('desconta 20 por CRITICAL e 5 por WARNING', () => {
    expect(scoreFromFindings([f('CRITICAL'), f('WARNING')])).toBe(75);
  });

  it('nunca fica abaixo de 0', () => {
    expect(
      scoreFromFindings([
        f('CRITICAL'),
        f('CRITICAL'),
        f('CRITICAL'),
        f('CRITICAL'),
        f('CRITICAL'),
        f('CRITICAL'),
      ])
    ).toBe(0);
  });

  it('INFO nao pontua', () => {
    expect(scoreFromFindings([f('INFO'), f('INFO')])).toBe(100);
  });
});
