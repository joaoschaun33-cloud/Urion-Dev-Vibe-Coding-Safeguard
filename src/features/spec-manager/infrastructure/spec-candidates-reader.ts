// src/features/spec-manager/infrastructure/spec-candidates-reader.ts
// I/O do gate de spec: le os .md de specs do projeto (somente leitura, so nas
// pastas convencionais de spec — nunca varre o projeto inteiro).

import fs from 'node:fs';
import path from 'node:path';
import type { SpecCandidate } from '../application/check-spec-gate';

const SPEC_DIRS = [
  'docs/00-context',
  'docs/01-product',
  'docs/specs',
  'specs',
  '00-context',
  '01-product',
];
const MAX_DEPTH = 3;
const MAX_FILE_BYTES = 500 * 1024;

function walk(dir: string, rootDir: string, depth: number, out: SpecCandidate[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (depth < MAX_DEPTH) {
        walk(full, rootDir, depth + 1, out);
      }
      continue;
    }
    if (!entry.name.toLowerCase().endsWith('.md')) {
      continue;
    }
    try {
      if (fs.statSync(full).size > MAX_FILE_BYTES) {
        continue;
      }
      out.push({
        path: path.relative(rootDir, full).replace(/\\/g, '/'),
        content: fs.readFileSync(full, 'utf8'),
      });
    } catch {
      continue;
    }
  }
}

export function collectSpecCandidates(rootDir: string): SpecCandidate[] {
  const out: SpecCandidate[] = [];
  for (const d of SPEC_DIRS) {
    const abs = path.join(rootDir, d);
    if (fs.existsSync(abs)) {
      walk(abs, rootDir, 0, out);
    }
  }
  return out;
}
