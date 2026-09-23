// src/features/security-audit/application/detect-swallowed-errors.ts
// Detector PURO: blocos catch vazios que engolem o erro em silencio (R6).
// Escopo restrito a bloco REALMENTE vazio (so espacos/quebras de linha) — um
// catch com log, rethrow, ou ate um comentario explicando a decisao nao e
// flagado, para manter falso-positivo baixo.

import { type Finding } from '../domain/findings';

const EMPTY_CATCH_RE = /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g;
const EMPTY_PROMISE_CATCH_RE = /\.catch\(\s*(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>\s*\{\s*\}\s*\)/g;

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function detectSwallowedErrors(files: Array<{ path: string; content: string }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!/\.(?:m|c)?[jt]sx?$/.test(file.path)) {
      continue;
    }
    for (const re of [EMPTY_CATCH_RE, EMPTY_PROMISE_CATCH_RE]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(file.content)) !== null) {
        findings.push({
          ruleId: 'ERROR_SWALLOWED',
          severity: 'WARNING',
          file: file.path,
          line: lineOf(file.content, m.index),
          message: 'Bloco catch vazio: o erro e capturado e descartado em silencio.',
          remediation:
            'No minimo registre o erro (logger.error) antes de decidir ignora-lo; falhas silenciosas escondem bugs ate virarem incidente em producao.',
        });
      }
    }
  }

  return findings;
}
