// src/mcp/urion-mcp-server.ts

/**
 * 🛡️ URION VIBEGUARD MCP SERVER (Model Context Protocol)
 * Interceptação e Guardrail de Segurança em Tempo Real para IAs (Cursor, Claude Code, Antigravity)
 *
 * Ferramentas disponibilizadas:
 * 1. urion_security_check: Valida trecho de código contra as 5 vulnerabilidades vitais.
 * 2. urion_explain_risk: Traduz vulnerabilidades técnicas para explicação leiga e risco real de mercado.
 */

import { VIBE_GUARD_RULES } from '../features/security-audit/domain/vibe-guard-rules';

export interface McpCheckResult {
  allowed: boolean;
  status: 'APPROVED' | 'REJECTED';
  violations: Array<{
    ruleId: string;
    title: string;
    descriptionLeiga: string;
    riscoReal: string;
    recomendacao: string;
  }>;
}

export class UrionMcpGuardServer {
  /**
   * Avalia o código proposto pela IA antes de ser aceito no arquivo.
   */
  public checkCodeSafety(codeSnippet: string): McpCheckResult {
    const violations = [];

    for (const rule of VIBE_GUARD_RULES) {
      if (rule.regex.test(codeSnippet)) {
        violations.push({
          ruleId: rule.id,
          title: rule.title,
          descriptionLeiga: rule.descriptionLeiga,
          riscoReal: rule.riscoReal,
          recomendacao: rule.recomendacaoLeiga,
        });
      }
    }

    const isRejected = violations.some(
      (v) =>
        v.ruleId === 'SECRETS_HARDCODED' ||
        v.ruleId === 'AUTH_CLIENT_SIDE' ||
        v.ruleId === 'SQL_INJECTION'
    );

    return {
      allowed: !isRejected,
      status: isRejected ? 'REJECTED' : 'APPROVED',
      violations,
    };
  }

  /**
   * Explica o risco de uma vulnerabilidade em linguagem simples para o usuário.
   */
  public explainRisk(ruleId: string): string {
    const rule = VIBE_GUARD_RULES.find((r) => r.id.toLowerCase() === ruleId.toLowerCase());
    if (!rule) {
      return 'Vulnerabilidade não catalogada. Por favor, verifique com o suporte Urion.';
    }

    return `
🚨 URION VIBEGUARD DIAGNÓSTICO:
📌 Problema: ${rule.title}
💡 Explicação: ${rule.descriptionLeiga}
💣 Risco Real: ${rule.riscoReal}
🛠️ Como Corrigir: ${rule.recomendacaoLeiga}
    `.trim();
  }
}
