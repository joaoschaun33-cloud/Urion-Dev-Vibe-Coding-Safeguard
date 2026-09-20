// src/mcp/server.ts
// Monta o servidor MCP real (McpServer + tools). SEM efeitos colaterais no import:
// o boot (transporte stdio) fica em src/mcp/index.ts, para permitir testes.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { runSecurityCheck, runExplainRisk, runSpecGate } from './tools';

export const URION_MCP_INFO = { name: 'urion-vibeguard', version: '2.0.0' } as const;

export function createUrionMcpServer(): McpServer {
  const server = new McpServer(URION_MCP_INFO);

  server.registerTool(
    'urion_security_check',
    {
      title: 'Urion Security Check',
      description:
        'Verifica um trecho de codigo contra as 5 vulnerabilidades criticas de apps gerados por IA ' +
        '(segredos hardcoded, auth no navegador, SQL injection, XSS, falta de rate limiting). ' +
        'Retorna APPROVED ou REJECTED com explicacao em portugues simples. Parecer consultivo, nao bloqueio.',
      inputSchema: { code: z.string().describe('O trecho de codigo a verificar.') },
      outputSchema: {
        status: z.enum(['APPROVED', 'REJECTED']),
        score: z.number(),
        findings: z.array(
          z.object({
            ruleId: z.string(),
            severity: z.string(),
            file: z.string(),
            line: z.number().optional(),
            message: z.string(),
            remediation: z.string(),
          })
        ),
        remediations: z.array(z.string()),
      },
    },
    (args) => {
      const r = runSecurityCheck({ code: args.code });
      return {
        content: r.content,
        structuredContent: r.structuredContent as unknown as Record<string, unknown>,
        isError: r.isError,
      };
    }
  );

  server.registerTool(
    'urion_explain_risk',
    {
      title: 'Urion Explain Risk',
      description:
        'Explica, em portugues simples, o risco de uma regra do VibeGuard ' +
        '(ex.: SECRETS_HARDCODED, AUTH_CLIENT_SIDE, SQL_INJECTION, XSS_UNSANITIZED, RATE_LIMIT_MISSING).',
      inputSchema: { ruleId: z.string().describe('O ID da regra, ex.: SECRETS_HARDCODED.') },
    },
    (args) => {
      const r = runExplainRisk({ ruleId: args.ruleId });
      return { content: r.content, isError: r.isError };
    }
  );

  server.registerTool(
    'urion_spec_gate',
    {
      title: 'Urion Spec Gate',
      description:
        'Gate de spec (Spec-Driven Development): chame ANTES de implementar uma feature. ' +
        'Retorna SPEC_OK quando existe spec com criterios de aceite; NEEDS_SPEC ou INCOMPLETE_SPEC ' +
        'quando falta — nesses casos NAO implemente: peca/complete a spec com o usuario. Parecer consultivo.',
      inputSchema: {
        feature: z
          .string()
          .min(1)
          .describe('Nome da feature a implementar, ex.: "login com google".'),
        projectPath: z
          .string()
          .optional()
          .describe('Raiz do projeto (padrao: diretorio atual do servidor MCP).'),
      },
      outputSchema: {
        status: z.enum(['SPEC_OK', 'NEEDS_SPEC', 'INCOMPLETE_SPEC']),
        feature: z.string(),
        spec: z
          .object({
            path: z.string(),
            title: z.string(),
            criteria: z.number(),
            completedCriteria: z.number(),
          })
          .nullable(),
        message: z.string(),
        nextStep: z.string(),
      },
    },
    (args) => {
      const r = runSpecGate({ feature: args.feature, projectPath: args.projectPath });
      return {
        content: r.content,
        structuredContent: r.structuredContent as unknown as Record<string, unknown>,
        isError: r.isError,
      };
    }
  );

  return server;
}
