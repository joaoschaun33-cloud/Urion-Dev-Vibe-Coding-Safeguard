// src/features/security-audit/presentation/checks-cli.ts
// CLI do Config Gate (Bloco A). Faz I/O (le o repo), roda os detectores puros e
// imprime um relatorio. Entry bundlado por esbuild em bin/urion-checks.mjs.
// Uso: urion-checks [dir] [--strict]   (--strict => exit 1 se houver CRITICAL)

import fs from 'node:fs';
import path from 'node:path';
import { detectMissingRls } from '../application/detect-missing-rls';
import { detectUnprotectedRoutes } from '../application/detect-unprotected-routes';
import { detectEnvLeaks } from '../application/detect-env-leaks';
import { scoreFromFindings, type Finding } from '../domain/findings';
import { isTestOrFixturePath } from '../domain/scan-filters';

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.urion',
  '.next',
  'coverage',
  'web',
]);

interface FileEntry {
  path: string;
  content: string;
}

function safeRead(p: string): string {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function walk(root: string): { code: FileEntry[]; sql: FileEntry[]; envFiles: string[] } {
  const code: FileEntry[] = [];
  const sql: FileEntry[] = [];
  const envFiles: string[] = [];

  const rec = (dir: string): void => {
    let list: string[] = [];
    try {
      list = fs.readdirSync(dir);
    } catch {
      return;
    }
    for (const item of list) {
      const full = path.join(dir, item);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.has(item)) {
          rec(full);
        }
        continue;
      }
      const rel = path.relative(root, full).replace(/\\/g, '/');
      const ext = path.extname(item).toLowerCase();
      if (/^\.env(\.|$)/.test(item)) {
        envFiles.push(rel);
      } else if (ext === '.sql') {
        sql.push({ path: rel, content: safeRead(full) });
      } else if (/\.(?:m|c)?[jt]sx?$/.test(item) && !isTestOrFixturePath(rel)) {
        code.push({ path: rel, content: safeRead(full) });
      }
    }
  };

  rec(root);
  return { code, sql, envFiles };
}

function main(): void {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const root = args.find((a) => !a.startsWith('--')) ?? process.cwd();

  const { code, sql, envFiles } = walk(root);
  const gitignore = safeRead(path.join(root, '.gitignore'));

  const findings: Finding[] = [
    ...detectMissingRls(sql),
    ...detectUnprotectedRoutes(code),
    ...detectEnvLeaks({ gitignore, envFiles }),
  ];
  const score = scoreFromFindings(findings);
  const critical = findings.filter((f) => f.severity === 'CRITICAL').length;

  const out = (s: string): void => {
    process.stdout.write(`${s}\n`);
  };

  out('🛡️  Urion Config Gate — RLS / Auth / .env');
  out(
    `Score: ${String(score)}/100 · ${String(findings.length)} achado(s) (${String(critical)} critico(s))\n`
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

  if (strict && critical > 0) {
    process.exit(1);
  }
}

main();
