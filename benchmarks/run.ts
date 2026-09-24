// Executa o corpus contra os dois motores reais e gera benchmarks/RESULTS.md + results.json.
// Uso: npm run benchmark
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEnginesOnFiles } from './lib/engines';
import { consoleSummary, renderReport, type EngineRun } from './lib/report';
import { CHECKS_RULES, VIBEGUARD_RULES, type BenchCase, type CaseOutcome } from './lib/types';
import { vibeguardCases } from './fixtures/vibeguard';
import { checksCases } from './fixtures/checks';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const cases: BenchCase[] = [...vibeguardCases, ...checksCases];

const seen = new Set<string>();
for (const c of cases) {
  if (seen.has(c.id)) {
    throw new Error(`Caso duplicado no corpus: ${c.id}`);
  }
  seen.add(c.id);
}

const vg: CaseOutcome[] = [];
const ck: CaseOutcome[] = [];
for (const c of cases) {
  const fired = runEnginesOnFiles(c.files);
  vg.push({ id: c.id, expected: new Set(c.expect.vibeguard ?? []), fired: fired.vibeguard });
  ck.push({ id: c.id, expected: new Set(c.expect.checks ?? []), fired: fired.checks });
}

const runs: EngineRun[] = [
  { engine: 'vibeguard', label: 'Motor 1 — `npx urion-safeguard vibeguard` (5 regras)', rules: VIBEGUARD_RULES, outcomes: vg },
  { engine: 'checks', label: 'Motor 2 — `urion-checks` (R1–R9 + N+1)', rules: CHECKS_RULES, outcomes: ck },
];

const version = (JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as { version: string }).version;
fs.writeFileSync(path.join(here, 'RESULTS.md'), renderReport(runs, cases, { version }));
fs.writeFileSync(
  path.join(here, 'results.json'),
  JSON.stringify(
    {
      version,
      cases: cases.length,
      perCase: cases.map((c, i) => ({
        id: c.id,
        vibeguard: { expected: [...vg[i].expected].sort(), fired: [...vg[i].fired].sort() },
        checks: { expected: [...ck[i].expected].sort(), fired: [...ck[i].fired].sort() },
      })),
    },
    null,
    2
  ) + '\n'
);

console.log(`Corpus: ${String(cases.length)} casos`);
console.log(consoleSummary(runs));
console.log('\nRelatorio completo: benchmarks/RESULTS.md');
