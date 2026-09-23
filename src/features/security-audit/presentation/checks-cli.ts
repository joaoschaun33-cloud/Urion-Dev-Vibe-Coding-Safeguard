// src/features/security-audit/presentation/checks-cli.ts
// CLI do Config Gate (Bloco A). Imprime o relatorio de runConfigGate.
// Entry bundlado por esbuild em bin/urion-checks.mjs.
// Uso: urion-checks [dir] [--strict]   (--strict => exit 1 se houver CRITICAL)

import { runConfigGate } from './run-config-gate';

function main(): void {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const root = args.find((a) => !a.startsWith('--')) ?? process.cwd();

  const { findings, score, criticalCount } = runConfigGate(root);

  const out = (s: string): void => {
    process.stdout.write(`${s}\n`);
  };

  out(
    '🛡️  Urion Config Gate — R1-R9 + N+1 (RLS, auth, .env, userId, erros, webhook, validacao, consultas em loop)'
  );
  out(
    `Score: ${String(score)}/100 · ${String(findings.length)} achado(s) (${String(criticalCount)} critico(s))\n`
  );
  for (const f of findings) {
    const loc = f.line ? `:${String(f.line)}` : '';
    out(`[${f.severity}] ${f.ruleId} — ${f.file}${loc}`);
    out(`  ${f.message}`);
    out(`  → ${f.remediation}\n`);
  }
  if (findings.length === 0) {
    out('✅ Nenhum problema de configuracao detectado.');
  }

  if (strict && criticalCount > 0) {
    process.exit(1);
  }
}

main();
