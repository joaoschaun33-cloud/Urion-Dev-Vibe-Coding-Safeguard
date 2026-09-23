// src/mcp/launch-gate-runner.ts
// Coleta os fatos do projeto (I/O) e alimenta o gate de launch puro (3.4).
// Camada de entrada (como src/mcp): pode compor varias features; as features
// em si nao se importam entre si.

import fs from 'node:fs';
import path from 'node:path';
import { evaluateAuditReport, type AuditEvaluation } from '../shared/domain/audit-report';
import { evaluateLaunchGate, type LaunchGateResult } from '../shared/domain/launch-gate';
import { countCriteria } from '../features/spec-manager/application/check-spec-gate';
import { collectSpecCandidates } from '../features/spec-manager/infrastructure/spec-candidates-reader';
import { runConfigGate } from '../features/security-audit/presentation/run-config-gate';
import { ScanVibeGuardUseCase } from '../features/security-audit/application/scan-vibe-guard';

export const AUDIT_DIR = '.urion/audit';

// Espelho TS de bin/lib/coverage-reader.cjs (o CLI zero-install e CommonJS).
function readCoveragePct(root: string): number | null {
  try {
    const raw = fs.readFileSync(path.join(root, 'coverage', 'coverage-summary.json'), 'utf8');
    const pct = (JSON.parse(raw) as { total?: { lines?: { pct?: unknown } } }).total?.lines?.pct;
    return typeof pct === 'number' && !Number.isNaN(pct) ? Math.round(pct) : null;
  } catch {
    return null;
  }
}

// docs/00-context/feature-spec.md e o TEMPLATE generico ("[NOME_DA_FEATURE]")
// usado para redigir novas specs — nunca uma entrega com criterios reais.
// Contá-lo como spec faria o gate exigir que um template ficasse "concluido",
// o que nao faz sentido (achado real ao verificar as specs desta sessao).
const TEMPLATE_PATHS = new Set(['docs/00-context/feature-spec.md']);

function isSpecLike(p: string): boolean {
  if (TEMPLATE_PATHS.has(p)) {
    return false;
  }
  const base = p.split('/').pop() ?? p;
  return /spec/i.test(base) || /(^|\/)specs\//.test(p);
}

/** Ultimo relatorio de auditoria (o mais recente vence; um REJECTED novo anula um APPROVED antigo). */
export function readLatestAudit(
  root: string,
  now: Date = new Date()
): { evaluation: AuditEvaluation; file: string } | null {
  const dir = path.join(root, AUDIT_DIR);
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.json'));
  } catch {
    return null;
  }

  let best: { evaluation: AuditEvaluation; file: string; at: number } | null = null;
  let firstInvalid: { evaluation: AuditEvaluation; file: string } | null = null;

  for (const file of files) {
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch {
      firstInvalid ??= {
        file,
        evaluation: {
          status: 'INVALID',
          independent: false,
          sameModel: false,
          ageDays: null,
          openBlocking: 0,
          problems: [`${file}: JSON invalido ou ilegivel`],
          notes: [],
        },
      };
      continue;
    }
    const evaluation = evaluateAuditReport(raw, now);
    if (evaluation.status === 'INVALID') {
      firstInvalid ??= { file, evaluation };
      continue;
    }
    const at = Date.parse((raw as { reviewedAt: string }).reviewedAt);
    if (!best || at > best.at) {
      best = { evaluation, file, at };
    }
  }

  if (best) {
    return { evaluation: best.evaluation, file: best.file };
  }
  return firstInvalid;
}

export interface LaunchGateReport {
  result: LaunchGateResult;
  auditFile: string | null;
}

export async function runLaunchGate(
  projectPath: string,
  now: Date = new Date()
): Promise<LaunchGateReport> {
  const root = path.resolve(projectPath);

  const specs = collectSpecCandidates(root)
    .filter((c) => isSpecLike(c.path))
    .map((c) => {
      const { total, completed } = countCriteria(c.content);
      return { path: c.path, criteria: total, completedCriteria: completed };
    });

  const pct = readCoveragePct(root);
  const configCritical = runConfigGate(root).criticalCount;
  const vibeGuard = await new ScanVibeGuardUseCase().execute(root);
  const audit = readLatestAudit(root, now);

  const result = evaluateLaunchGate({
    specs,
    coverage: { measured: pct !== null, pct },
    security: { criticalCount: configCritical + vibeGuard.criticalCount },
    review: audit ? audit.evaluation : null,
  });

  return { result, auditFile: audit ? audit.file : null };
}
