// Roda os dois motores em cada repositorio de um diretorio e grava os achados brutos.
// Uso: npx tsx benchmarks/real/scan.ts <dir-com-repos> <arquivo-saida.json>
// Os DADOS (nomes/caminhos de repositorios de terceiros) nunca entram neste repositorio.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runConfigGate } from '../../src/features/security-audit/presentation/run-config-gate';

const require = createRequire(import.meta.url);
const { scanProject } = require('../../bin/lib/mode-maker.cjs') as {
  scanProject: (dir: string) => {
    scannedFiles: number;
    issues: Array<{ rule: { id: string }; file: string; line: number; snippet: string }>;
  };
};

const [, , reposDir, outFile] = process.argv;
if (!reposDir || !outFile) {
  console.error('Uso: tsx benchmarks/real/scan.ts <dir-com-repos> <saida.json>');
  process.exit(1);
}

interface RepoResult {
  id: string;
  scannedFiles: number;
  ms: number;
  vibeguard: Array<{ rule: string; file: string; line: number; snippet: string }>;
  checks: Array<{ rule: string; file: string; line?: number; message: string }>;
  error?: string;
}

const results: RepoResult[] = [];
for (const id of fs.readdirSync(reposDir).sort()) {
  const dir = path.join(reposDir, id);
  if (!fs.statSync(dir).isDirectory()) {
    continue;
  }
  const t0 = Date.now();
  try {
    const vg = scanProject(dir);
    const ck = runConfigGate(dir);
    results.push({
      id,
      scannedFiles: vg.scannedFiles,
      ms: Date.now() - t0,
      vibeguard: vg.issues.map((i) => ({ rule: i.rule.id, file: i.file, line: i.line, snippet: i.snippet.slice(0, 220) })),
      checks: ck.findings.map((f) => ({ rule: f.ruleId, file: f.file, line: f.line, message: f.message })),
    });
  } catch (e) {
    results.push({ id, scannedFiles: 0, ms: Date.now() - t0, vibeguard: [], checks: [], error: String(e) });
  }
}
fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
const total = (k: 'vibeguard' | 'checks'): number => results.reduce((n, r) => n + r[k].length, 0);
console.log(`repos=${String(results.length)} vibeguard=${String(total('vibeguard'))} checks=${String(total('checks'))} erros=${String(results.filter((r) => r.error).length)}`);
