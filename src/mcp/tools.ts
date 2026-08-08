// src/mcp/tools.ts
// Handlers PUROS das tools MCP do Urion. Sem transporte, sem SDK: testaveis isoladamente.
// Delegam a UrionMcpGuardServer (logica) e usam as regras da FONTE UNICA (Fase 0.4).

import { UrionMcpGuardServer } from './urion-mcp-server';
import { VIBE_GUARD_RULES } from '../features/security-audit/domain/vibe-guard-rules';
import {
  scoreFromFindings,
  type Finding,
  type Severity,
} from '../features/security-audit/domain/findings';

const guard = new UrionMcpGuardServer();

export interface StructuredSecurityResult {
  status: 'APPROVED' | 'REJECTED';
  score: number;
  findings: Finding[];
  remediations: string[];
}

export interface ToolTextResult {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent: StructuredSecurityResult;
  isError: boolean;
}

/**
 * Verifica um trecho de codigo contra as 5 vulnerabilidades criticas.
 * NAO bloqueia nada fisicamente: retorna um parecer (advisory) — texto amigavel +
 * conteudo estruturado (status/score/findings/remediations) para consumo programatico.
 */
export function runSecurityCheck(input: { code: string }): ToolTextResult {
  const result = guard.checkCodeSafety(input.code);

  const findings: Finding[] = result.violations.map((v) => {
    const rule = VIBE_GUARD_RULES.find((r) => r.id === v.ruleId);
    const severity: Severity = rule?.severity ?? 'WARNING';
    return {
      ruleId: v.ruleId,
      severity,
      file: '(snippet)',
      message: v.title,
      remediation: v.recomendacao,
    };
  });

  const score = scoreFromFindings(findings);

  const header =
    result.status === 'APPROVED'
      ? `✅ APPROVED (score ${String(score)}) — nenhuma das 5 vulnerabilidades criticas foi detectada.`
      : `🔴 REJECTED (score ${String(score)}) — ${String(findings.length)} violacao(oes).`;

  const lines = result.violations.map(
    (v) => `- [${v.ruleId}] ${v.title}\n  Risco: ${v.riscoReal}\n  Como resolver: ${v.recomendacao}`
  );

  return {
    content: [{ type: 'text', text: [header, ...lines].join('\n') }],
    structuredContent: {
      status: result.status,
      score,
      findings,
      remediations: findings.map((f) => f.remediation),
    },
    isError: false,
  };
}

/**
 * Explica, em portugues simples, o risco de uma regra do VibeGuard.
 * Retorna isError=true (sem inventar) quando o ruleId nao existe.
 */
export function runExplainRisk(input: { ruleId: string }): {
  content: Array<{ type: 'text'; text: string }>;
  isError: boolean;
} {
  const ruleId = input.ruleId;
  const known = VIBE_GUARD_RULES.some((r) => r.id.toLowerCase() === ruleId.toLowerCase());

  if (!known) {
    const validos = VIBE_GUARD_RULES.map((r) => r.id).join(', ');
    return {
      content: [
        { type: 'text', text: `Regra "${ruleId}" nao encontrada. IDs validos: ${validos}.` },
      ],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: guard.explainRisk(ruleId) }],
    isError: false,
  };
}
