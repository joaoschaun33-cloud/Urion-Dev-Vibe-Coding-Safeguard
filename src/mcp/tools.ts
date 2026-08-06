// src/mcp/tools.ts
// Handlers PUROS das tools MCP do Urion. Sem transporte, sem SDK: testaveis isoladamente.
// Delegam a UrionMcpGuardServer (logica) e usam as regras da FONTE UNICA (Fase 0.4).

import { UrionMcpGuardServer } from './urion-mcp-server';
import { VIBE_GUARD_RULES } from '../features/security-audit/domain/vibe-guard-rules';

const guard = new UrionMcpGuardServer();

export interface ToolTextResult {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent?: unknown;
  isError: boolean;
}

/**
 * Verifica um trecho de codigo contra as 5 vulnerabilidades criticas.
 * NAO bloqueia nada fisicamente: retorna um parecer (advisory) para a IA usar.
 */
export function runSecurityCheck(input: { code: string }): ToolTextResult {
  const result = guard.checkCodeSafety(input.code);

  const header =
    result.status === 'APPROVED'
      ? '✅ APPROVED — nenhuma das 5 vulnerabilidades criticas foi detectada neste trecho.'
      : `🔴 REJECTED — ${String(result.violations.length)} violacao(oes) critica(s).`;

  const lines = result.violations.map(
    (v) => `- [${v.ruleId}] ${v.title}\n  Risco: ${v.riscoReal}\n  Como resolver: ${v.recomendacao}`
  );

  return {
    content: [{ type: 'text', text: [header, ...lines].join('\n') }],
    structuredContent: result,
    isError: false,
  };
}

/**
 * Explica, em portugues simples, o risco de uma regra do VibeGuard.
 * Retorna isError=true (sem inventar) quando o ruleId nao existe.
 */
export function runExplainRisk(input: { ruleId: string }): ToolTextResult {
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
