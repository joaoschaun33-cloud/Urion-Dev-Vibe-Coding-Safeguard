// src/mcp/gates-cli.ts
// CLI dos gates de processo.
//   gates-cli launch [dir]        -> gate de launch (exit 0 = Grade A, 1 = NOT_READY)
//   gates-cli audit <relatorio>   -> valida um relatorio do Auditor (exit 0 = APPROVED valido)

import fs from 'node:fs';
import path from 'node:path';
import { evaluateAuditReport } from '../shared/domain/audit-report';
import { runLaunchGate } from './launch-gate-runner';
import { formatLaunchGate } from './launch-tool';

const out = (s: string): void => {
  process.stdout.write(`${s}\n`);
};

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const arg = argv.at(1);

  if (cmd === 'launch') {
    const { result, auditFile } = await runLaunchGate(path.resolve(arg ?? process.cwd()));
    out(formatLaunchGate(result, auditFile));
    return result.ready ? 0 : 1;
  }

  if (cmd === 'audit') {
    if (!arg) {
      out('Uso: gates-cli audit <caminho-do-relatorio.json>');
      return 2;
    }
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(arg, 'utf8'));
    } catch (err) {
      out(
        `❌ Nao foi possivel ler/parsear ${arg}: ${err instanceof Error ? err.message : String(err)}`
      );
      return 2;
    }
    const ev = evaluateAuditReport(raw);
    out(
      `Auditoria: ${ev.status} · independente: ${ev.independent ? 'sim' : 'nao'} · abertos CRITICAL/HIGH: ${String(ev.openBlocking)}`
    );
    ev.problems.forEach((p) => {
      out(`  ❌ ${p}`);
    });
    ev.notes.forEach((n) => {
      out(`  ℹ️  ${n}`);
    });
    return ev.status === 'APPROVED' ? 0 : 1;
  }

  out('Uso: gates-cli launch [dir] | gates-cli audit <relatorio.json>');
  return 2;
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((err: unknown) => {
    process.stderr.write(`Erro fatal: ${String(err)}\n`);
    process.exit(2);
  });
