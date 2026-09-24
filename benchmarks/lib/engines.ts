import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runConfigGate } from '../../src/features/security-audit/presentation/run-config-gate';
import type { EngineName } from './types';

const require = createRequire(import.meta.url);

interface ScanProjectResult {
  issues: Array<{ rule: { id: string } }>;
}
// O mesmo arquivo que o pacote npm publica (comando `npx urion-safeguard vibeguard`).
const { scanProject } = require('../../bin/lib/mode-maker.cjs') as {
  scanProject: (dir: string) => ScanProjectResult;
};

export function materialize(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-bench-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }
  return dir;
}

/** Roda os DOIS motores reais num diretorio e devolve, por motor, os ruleIds que dispararam. */
export function runEnginesOnDir(dir: string): Record<EngineName, Set<string>> {
  return {
    vibeguard: new Set(scanProject(dir).issues.map((i) => i.rule.id)),
    checks: new Set(runConfigGate(dir).findings.map((f) => f.ruleId)),
  };
}

export function runEnginesOnFiles(files: Record<string, string>): Record<EngineName, Set<string>> {
  const dir = materialize(files);
  try {
    return runEnginesOnDir(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
