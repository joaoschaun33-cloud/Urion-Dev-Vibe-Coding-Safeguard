// src/features/security-audit/application/detect-n-plus-one.ts
// Detector PURO: consulta de LEITURA ao banco dentro de um loop (padrao N+1).
// Heuristica por texto (sem AST): acha loops (for/while e callbacks map/forEach/
// flatMap/filter/reduce/some/every), extrai o trecho do corpo com balanceamento
// de delimitadores e procura chamadas de leitura de ORM/driver nele.
// Escopo deliberado: so LEITURAS (find*/count/aggregate/query). Escrita em loop
// e outro problema (N inserts), nao N+1. Opt-out: "// N+1-OK: motivo" na linha
// da consulta ou na linha anterior (ex.: loop pequeno e de tamanho fixo).

import { type Finding } from '../domain/findings';

const LOOP_RE =
  /\bfor\s*(?:await\s*)?\(|\bwhile\s*\(|\.(?:map|forEach|flatMap|filter|reduce|some|every)\s*\(/g;

const READ_QUERY_RE = new RegExp(
  [
    String.raw`\bprisma\.\w+\.(?:findUnique|findUniqueOrThrow|findFirst|findFirstOrThrow|findMany|count|aggregate|groupBy)\s*\(`,
    String.raw`\b(?:db|pool|client|connection|knex|sequelize|entityManager)\.(?:query|execute|raw)\s*\(`,
    String.raw`\.(?:findById|findByPk|findOne|findOneBy|findByIds)\s*\(`,
    String.raw`\b\w*[rR]epo(?:sitory)?\.(?:find|get|list|fetch)\w*\s*\(`,
  ].join('|'),
  'g'
);

const OPT_OUT_RE = /\/\/\s*N\+1-OK\b/i;

// Substitui comentarios por espacos, preservando quebras de linha (numero de linha
// continua correto). O `[^:]` antes de `//` evita cortar URLs (https://...).
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, pre: string) => pre);
}

function matchClose(text: string, openIdx: number): number {
  const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  const open = text[openIdx];
  const close = pairs[open];
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

// Retorna o intervalo [inicio, fim) do corpo do loop que comeca em `openParenIdx`.
function loopSpan(text: string, matchText: string, openParenIdx: number): [number, number] | null {
  const closeParen = matchClose(text, openParenIdx);
  if (closeParen < 0) {
    return null;
  }
  const isCallback = matchText.startsWith('.');
  if (isCallback) {
    return [openParenIdx, closeParen + 1];
  }
  // for/while: o corpo e o bloco { } seguinte, ou uma unica instrucao ate ';'.
  let i = closeParen + 1;
  while (i < text.length && /\s/.test(text[i])) {
    i++;
  }
  if (text[i] === '{') {
    const closeBrace = matchClose(text, i);
    return closeBrace < 0 ? null : [i, closeBrace + 1];
  }
  const semi = text.indexOf(';', i);
  return [i, semi < 0 ? text.length : semi + 1];
}

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function detectNPlusOne(files: Array<{ path: string; content: string }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!/\.(?:m|c)?[jt]sx?$/.test(file.path)) {
      continue;
    }
    const original = file.content.split('\n');
    const text = stripComments(file.content);
    const reported = new Set<number>();

    const loopRe = new RegExp(LOOP_RE);
    let lm: RegExpExecArray | null;
    while ((lm = loopRe.exec(text)) !== null) {
      const openParenIdx = lm.index + lm[0].length - 1;
      const span = loopSpan(text, lm[0], openParenIdx);
      if (!span) {
        continue;
      }
      const body = text.slice(span[0], span[1]);
      const queryRe = new RegExp(READ_QUERY_RE);
      let qm: RegExpExecArray | null;
      while ((qm = queryRe.exec(body)) !== null) {
        const absIdx = span[0] + qm.index;
        if (reported.has(absIdx)) {
          continue;
        }
        reported.add(absIdx);
        const line = lineOf(text, absIdx);
        const here = original[line - 1] ?? '';
        const prev = original[line - 2] ?? '';
        if (OPT_OUT_RE.test(here) || OPT_OUT_RE.test(prev)) {
          continue;
        }
        findings.push({
          ruleId: 'N_PLUS_ONE',
          severity: 'WARNING',
          file: file.path,
          line,
          message:
            'Consulta ao banco dentro de um loop (for/while/map/forEach): uma query por item — padrao N+1.',
          remediation:
            'Busque tudo de uma vez fora do loop (findMany com where: { id: { in: ids } }, include/JOIN ou DataLoader) e monte o resultado em memoria. Se o loop e pequeno e de tamanho fixo, marque com "// N+1-OK: motivo".',
        });
      }
    }
  }

  return findings.sort((a, b) => a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0));
}
