// src/shared/domain/launch-gate.ts
// Gate de "pronto para launch" (roadmap 3.4). Dominio PURO: recebe fatos ja
// coletados (spec, cobertura, seguranca, revisao) e decide se pode receber
// Grade A. Nada de I/O aqui — a coleta fica em src/mcp/launch-gate-runner.ts.
//
// Regra: Grade A SO com os 4 itens verdadeiros — spec concluida, testes com
// cobertura REAL medida >= limite, sem achado critico de seguranca, e revisao
// independente aprovada e recente. Qualquer falha => NOT_READY (sem meio-termo).
//
// Limite declarado: e um gate de PROCESSO local. Os fatos vem de arquivos do
// proprio projeto e podem ser forjados por quem tem acesso a ele; nao ha
// verificacao server-side (continua no backlog do roadmap).

import type { AuditEvaluation } from './audit-report';

export const LAUNCH_COVERAGE_THRESHOLD = 80;
export const LAUNCH_MAX_REVIEW_AGE_DAYS = 14;

export interface LaunchSpecFact {
  path: string;
  criteria: number;
  completedCriteria: number;
}

export interface LaunchGateInput {
  specs: LaunchSpecFact[];
  coverage: { measured: boolean; pct: number | null };
  security: { criticalCount: number };
  review: AuditEvaluation | null;
  coverageThreshold?: number;
  maxReviewAgeDays?: number;
}

export type LaunchCheckId = 'SPEC' | 'TESTS' | 'SECURITY' | 'REVIEW';

export interface LaunchCheck {
  id: LaunchCheckId;
  passed: boolean;
  detail: string;
}

export interface LaunchGateResult {
  grade: 'A' | 'NOT_READY';
  ready: boolean;
  checks: LaunchCheck[];
  blockers: string[];
}

function checkSpec(specs: LaunchSpecFact[]): LaunchCheck {
  const withCriteria = specs.filter((s) => s.criteria > 0);
  if (withCriteria.length === 0) {
    return {
      id: 'SPEC',
      passed: false,
      detail:
        'Nenhuma spec com criterios de aceite encontrada (docs/specs/, docs/01-product/spec-*.md).',
    };
  }
  const open = withCriteria.filter((s) => s.completedCriteria < s.criteria);
  if (open.length > 0) {
    const list = open
      .slice(0, 3)
      .map((s) => `${s.path} (${String(s.completedCriteria)}/${String(s.criteria)})`)
      .join(', ');
    const more = open.length > 3 ? ` e mais ${String(open.length - 3)}` : '';
    return {
      id: 'SPEC',
      passed: false,
      detail: `Criterios de aceite em aberto em ${String(open.length)} spec(s): ${list}${more}.`,
    };
  }
  return {
    id: 'SPEC',
    passed: true,
    detail: `${String(withCriteria.length)} spec(s) com todos os criterios de aceite concluidos.`,
  };
}

function checkTests(coverage: LaunchGateInput['coverage'], threshold: number): LaunchCheck {
  if (!coverage.measured || coverage.pct === null) {
    return {
      id: 'TESTS',
      passed: false,
      detail:
        'Cobertura nao medida: rode os testes com --coverage (reporter json-summary) para gerar coverage/coverage-summary.json.',
    };
  }
  if (coverage.pct < threshold) {
    return {
      id: 'TESTS',
      passed: false,
      detail: `Cobertura real ${String(coverage.pct)}% abaixo do minimo de ${String(threshold)}%.`,
    };
  }
  return {
    id: 'TESTS',
    passed: true,
    detail: `Cobertura real ${String(coverage.pct)}% (minimo ${String(threshold)}%).`,
  };
}

function checkSecurity(security: LaunchGateInput['security']): LaunchCheck {
  if (security.criticalCount > 0) {
    return {
      id: 'SECURITY',
      passed: false,
      detail: `${String(security.criticalCount)} achado(s) de seguranca CRITICO(S) — rode urion-checks e o scanner e corrija.`,
    };
  }
  return { id: 'SECURITY', passed: true, detail: 'Nenhum achado de seguranca critico.' };
}

function checkReview(review: LaunchGateInput['review'], maxAgeDays: number): LaunchCheck {
  if (!review) {
    return {
      id: 'REVIEW',
      passed: false,
      detail:
        'Nenhum relatorio de auditoria encontrado em .urion/audit/*.json (rode o Auditor em contexto fresco).',
    };
  }
  if (review.status !== 'APPROVED') {
    const why = review.problems.length > 0 ? ` ${review.problems.join('; ')}.` : '';
    return {
      id: 'REVIEW',
      passed: false,
      detail: `Ultima auditoria esta ${review.status}.${why}`,
    };
  }
  if (!review.independent) {
    return {
      id: 'REVIEW',
      passed: false,
      detail:
        'A auditoria foi feita em contexto compartilhado: nao conta como revisao independente.',
    };
  }
  if (review.ageDays !== null && review.ageDays > maxAgeDays) {
    return {
      id: 'REVIEW',
      passed: false,
      detail: `A auditoria aprovada tem ${String(Math.floor(review.ageDays))} dias (maximo ${String(maxAgeDays)}): refaca.`,
    };
  }
  const note = review.notes.length > 0 ? ` Obs.: ${review.notes.join('; ')}.` : '';
  return { id: 'REVIEW', passed: true, detail: `Auditoria independente aprovada.${note}` };
}

export function evaluateLaunchGate(input: LaunchGateInput): LaunchGateResult {
  const checks: LaunchCheck[] = [
    checkSpec(input.specs),
    checkTests(input.coverage, input.coverageThreshold ?? LAUNCH_COVERAGE_THRESHOLD),
    checkSecurity(input.security),
    checkReview(input.review, input.maxReviewAgeDays ?? LAUNCH_MAX_REVIEW_AGE_DAYS),
  ];
  const blockers = checks.filter((c) => !c.passed).map((c) => `[${c.id}] ${c.detail}`);
  const ready = blockers.length === 0;
  return { grade: ready ? 'A' : 'NOT_READY', ready, checks, blockers };
}
