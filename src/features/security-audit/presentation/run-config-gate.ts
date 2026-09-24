// src/features/security-audit/presentation/run-config-gate.ts
// Orquestra o Config Gate: le o projeto (I/O), roda os detectores puros e devolve
// os achados. Reutilizado pelo CLI (checks-cli.ts) e pelo gate de launch (3.4).

import fs from 'node:fs';
import path from 'node:path';
import { detectMissingRls, looksLikeSupabaseProject } from '../application/detect-missing-rls';
import { detectUnprotectedRoutes } from '../application/detect-unprotected-routes';
import { detectEnvLeaks } from '../application/detect-env-leaks';
import { detectUserIdFromClient } from '../application/detect-userid-from-client';
import { detectSwallowedErrors } from '../application/detect-swallowed-errors';
import { detectUnverifiedWebhook } from '../application/detect-unverified-webhook';
import { detectUnvalidatedWrite } from '../application/detect-unvalidated-write';
import { detectNPlusOne } from '../application/detect-n-plus-one';
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
  // Codigo gerado/vendorizado: nao e o codigo do projeto (ex.: bundle do service worker do PWA).
  'dev-dist',
  'vendor',
  'public',
  '.output',
  'storybook-static',
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

// Arquivo de codigo escrito a mao raramente passa disso; bundle/minificado
// (esbuild, webpack, etc.) rotineiramente passa muito. Acima do limite, os
// heuristicos por regex/linha viram ruido (linha aponta pra dependencia de
// terceiro empacotada, nao pro codigo do projeto) — melhor nao escanear do
// que gerar achado enganoso.
const MAX_CODE_FILE_BYTES = 200 * 1024;
const MAX_SMALL_FILE_BYTES = 100 * 1024;

interface Walked {
  code: FileEntry[];
  sql: FileEntry[];
  envFiles: string[];
  envContents: Record<string, string>;
  gitignores: Record<string, string>;
  manifests: string[];
  hasSupabaseDir: boolean;
}

function walk(root: string): Walked {
  const code: FileEntry[] = [];
  const sql: FileEntry[] = [];
  const envFiles: string[] = [];
  const envContents: Record<string, string> = {};
  const gitignores: Record<string, string> = {};
  const manifests: string[] = [];
  let hasSupabaseDir = false;

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
        if (item === 'supabase') {
          hasSupabaseDir = true;
        }
        // Pastas ocultas (.vite, .cache, .turbo...) sao cache/gerado, nao o codigo do projeto.
        if (!IGNORE_DIRS.has(item) && !item.startsWith('.')) {
          rec(full);
        }
        continue;
      }
      const rel = path.relative(root, full).replace(/\\/g, '/');
      const ext = path.extname(item).toLowerCase();
      if (/^\.env(\.|$)/.test(item)) {
        envFiles.push(rel);
        if (stat.size <= MAX_SMALL_FILE_BYTES) {
          envContents[rel] = safeRead(full);
        }
      } else if (item === '.gitignore') {
        const dirRel = path.posix.dirname(rel);
        gitignores[dirRel === '.' ? '' : dirRel] = safeRead(full);
      } else if (item === 'package.json' && stat.size <= MAX_SMALL_FILE_BYTES) {
        manifests.push(safeRead(full));
      } else if (ext === '.sql') {
        sql.push({ path: rel, content: safeRead(full) });
      } else if (
        /\.(?:m|c)?[jt]sx?$/.test(item) &&
        !isTestOrFixturePath(rel) &&
        stat.size <= MAX_CODE_FILE_BYTES
      ) {
        code.push({ path: rel, content: safeRead(full) });
      }
    }
  };

  rec(root);
  return { code, sql, envFiles, envContents, gitignores, manifests, hasSupabaseDir };
}

export interface ConfigGateResult {
  findings: Finding[];
  score: number;
  criticalCount: number;
}

export function runConfigGate(root: string): ConfigGateResult {
  const { code, sql, envFiles, envContents, gitignores, manifests, hasSupabaseDir } = walk(root);
  const supabaseProject = looksLikeSupabaseProject({ manifests, hasSupabaseDir, sqlFiles: sql });

  const findings: Finding[] = [
    ...detectMissingRls(sql, { supabaseProject }),
    ...detectUnprotectedRoutes(code),
    ...detectEnvLeaks({ gitignore: '', gitignores, envFiles, contents: envContents }),
    ...detectUserIdFromClient(code),
    ...detectSwallowedErrors(code),
    ...detectUnverifiedWebhook(code),
    ...detectUnvalidatedWrite(code),
    ...detectNPlusOne(code),
  ];

  return {
    findings,
    score: scoreFromFindings(findings),
    criticalCount: findings.filter((f) => f.severity === 'CRITICAL').length,
  };
}
