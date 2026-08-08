// src/features/security-audit/domain/findings.ts
// Tipos e utilitarios de "finding" compartilhados pelos detectores da Fase 2.
// Puro: sem I/O, sem framework (dominio).

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface Finding {
  ruleId: string;
  severity: Severity;
  file: string;
  line?: number;
  message: string;
  remediation: string;
}

/**
 * Score 0..100 a partir dos findings. Mesma formula do CLI/VibeGuard para consistencia:
 * 100 base, -20 por CRITICAL, -5 por WARNING (INFO nao pontua). Nunca abaixo de 0.
 */
export function scoreFromFindings(findings: Finding[]): number {
  const critical = findings.filter((f) => f.severity === 'CRITICAL').length;
  const warning = findings.filter((f) => f.severity === 'WARNING').length;
  const score = 100 - critical * 20 - warning * 5;
  return score < 0 ? 0 : score;
}
