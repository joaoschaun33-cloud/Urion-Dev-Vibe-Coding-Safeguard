// src/features/security-audit/application/detect-missing-rls.ts
// Detector PURO: tabelas SQL criadas sem Row Level Security (dor real Supabase).
// Heuristica conservadora; recebe arquivos ja lidos (I/O fica no CLI).

import { type Finding } from '../domain/findings';

function stripSqlComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function lastSegment(name: string): string {
  const parts = name.replace(/["`]/g, '').split('.');
  return (parts[parts.length - 1] ?? name).toLowerCase();
}

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function detectMissingRls(files: Array<{ path: string; content: string }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!file.path.toLowerCase().endsWith('.sql')) {
      continue;
    }
    const clean = stripSqlComments(file.content);

    const rlsTables = new Set<string>();
    const rlsRe =
      /alter\s+table\s+(?:if\s+exists\s+)?([\w."`]+)\s+enable\s+row\s+level\s+security/gi;
    let rm: RegExpExecArray | null;
    while ((rm = rlsRe.exec(clean)) !== null) {
      const t = rm[1];
      if (t) {
        rlsTables.add(lastSegment(t));
      }
    }

    const createRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?([\w."`]+)/gi;
    let cm: RegExpExecArray | null;
    while ((cm = createRe.exec(clean)) !== null) {
      const raw = cm[1];
      if (!raw) {
        continue;
      }
      const table = lastSegment(raw);
      if (!rlsTables.has(table)) {
        findings.push({
          ruleId: 'RLS_MISSING',
          severity: 'CRITICAL',
          file: file.path,
          line: lineOf(clean, cm.index),
          message: `Tabela "${table}" criada sem Row Level Security (RLS) habilitado.`,
          remediation: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY; e crie policies de acesso (Supabase).`,
        });
      }
    }
  }

  return findings;
}
