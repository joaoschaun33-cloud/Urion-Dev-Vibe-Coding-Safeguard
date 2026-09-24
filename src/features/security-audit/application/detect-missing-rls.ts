// src/features/security-audit/application/detect-missing-rls.ts
// Detector PURO: tabelas SQL criadas sem Row Level Security (dor real Supabase).
// Heuristica conservadora; recebe arquivos ja lidos (I/O fica no CLI).
//
// Medido em 81 repositorios reais: 44% dos alertas eram RLS ativado em OUTRA migracao do
// mesmo repositorio (o detector antigo olhava um arquivo por vez) e 16% vinham de projetos
// sem Supabase, onde RLS nem e o modelo de seguranca. Agora: o RLS e agregado entre TODOS
// os SQL e so se acusa em projeto Supabase.

import { type Finding } from '../domain/findings';

export interface RlsOptions {
  /** false => nao e projeto Supabase/PostgREST: nao acusar. undefined => legado (acusar). */
  supabaseProject?: boolean;
}

function stripSqlComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function lastSegment(name: string): string {
  const parts = name.replace(/["`]/g, '').split('.');
  return (parts[parts.length - 1] ?? name).toLowerCase();
}

/** Schema explicito, se houver ("public.t" -> "public", "t" -> null). */
function schemaOf(name: string): string | null {
  const parts = name.replace(/["`]/g, '').split('.');
  return parts.length > 1 ? parts[parts.length - 2].toLowerCase() : null;
}

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

const SUPABASE_SQL_SIGNAL =
  /auth\.uid\s*\(|auth\.users|auth\.jwt\s*\(|service_role|supabase_|\bauthenticated\b.*\banon\b/i;

/** Sinais de que o projeto usa Supabase/PostgREST (RLS e o modelo de seguranca). */
export function looksLikeSupabaseProject(input: {
  manifests: string[];
  hasSupabaseDir: boolean;
  sqlFiles: Array<{ path: string; content: string }>;
}): boolean {
  if (input.hasSupabaseDir) {
    return true;
  }
  if (input.manifests.some((m) => /"@?supabase[\w/-]*"\s*:/.test(m))) {
    return true;
  }
  return input.sqlFiles.some(
    (f) => /(^|\/)supabase\//i.test(f.path) || SUPABASE_SQL_SIGNAL.test(f.content)
  );
}

export function detectMissingRls(
  files: Array<{ path: string; content: string }>,
  options: RlsOptions = {}
): Finding[] {
  if (options.supabaseProject === false) {
    return [];
  }
  const sqlFiles = files
    .filter((f) => f.path.toLowerCase().endsWith('.sql'))
    .map((f) => ({ path: f.path, clean: stripSqlComments(f.content) }));

  // RLS habilitado em QUALQUER arquivo SQL do projeto vale para a tabela.
  const rlsTables = new Set<string>();
  const rlsRe =
    /alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?([\w."`]+)\s+(?:enable|force)\s+row\s+level\s+security/gi;
  for (const file of sqlFiles) {
    let rm: RegExpExecArray | null;
    while ((rm = rlsRe.exec(file.clean)) !== null) {
      const t = rm[1];
      if (t) {
        rlsTables.add(lastSegment(t));
      }
    }
  }

  const findings: Finding[] = [];
  const createRe = /create\s+(?!temp(?:orary)?\b)table\s+(?:if\s+not\s+exists\s+)?([\w."`]+)/gi;
  for (const file of sqlFiles) {
    let cm: RegExpExecArray | null;
    createRe.lastIndex = 0;
    while ((cm = createRe.exec(file.clean)) !== null) {
      const raw = cm[1];
      if (!raw) {
        continue;
      }
      // Schema explicito diferente de "public" nao e exposto pela API (PostgREST).
      const schema = schemaOf(raw);
      if (schema && schema !== 'public') {
        continue;
      }
      const table = lastSegment(raw);
      if (!rlsTables.has(table)) {
        findings.push({
          ruleId: 'RLS_MISSING',
          severity: 'CRITICAL',
          file: file.path,
          line: lineOf(file.clean, cm.index),
          message: `Tabela "${table}" criada sem Row Level Security (RLS) habilitado em nenhum SQL do projeto.`,
          remediation: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY; e crie policies de acesso (Supabase). Se o RLS foi ativado pelo painel do Supabase (fora do Git), versione essa migracao.`,
        });
      }
    }
  }

  return findings;
}
