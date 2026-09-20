// src/mcp/launch-tool.ts
// Handler da tool MCP urion_launch_gate e formatacao textual do resultado
// (reaproveitada pelo CLI gates-cli.ts).

import path from 'node:path';
import type { LaunchGateResult } from '../shared/domain/launch-gate';
import { runLaunchGate } from './launch-gate-runner';

export function formatLaunchGate(result: LaunchGateResult, auditFile: string | null): string {
  const header = result.ready
    ? '🎓 GRADE A — pronto para o launch (spec + testes + seguranca + revisao independente).'
    : `🛑 NOT_READY — ${String(result.blockers.length)} item(ns) impedindo o launch.`;
  const lines = result.checks.map((c) => `${c.passed ? '✅' : '❌'} ${c.id.padEnd(8)} ${c.detail}`);
  const audit = auditFile ? [`Auditoria considerada: .urion/audit/${auditFile}`] : [];
  return [header, ...lines, ...audit].join('\n');
}

export interface LaunchToolResult {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent: LaunchGateResult;
  isError: boolean;
}

/** Gate de launch (roadmap 3.4). Parecer consultivo: o bloqueio de verdade e o CI/pre-commit. */
export async function runLaunchGateTool(input: {
  projectPath?: string;
}): Promise<LaunchToolResult> {
  const root = path.resolve(input.projectPath ?? process.cwd());
  const { result, auditFile } = await runLaunchGate(root);
  return {
    content: [{ type: 'text', text: formatLaunchGate(result, auditFile) }],
    structuredContent: result,
    isError: false,
  };
}
