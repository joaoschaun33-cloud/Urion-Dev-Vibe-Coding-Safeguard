// src/features/security-audit/application/detect-swallowed-errors.ts
// Detector PURO: blocos catch vazios que engolem o erro em silencio (R6).
// Escopo restrito a bloco REALMENTE vazio (so espacos/quebras de linha) — um
// catch com log, rethrow, ou ate um comentario explicando a decisao nao e
// flagado, para manter falso-positivo baixo.
//
// Medido em 81 repositorios reais: so 25% dos alertas importavam. O resto era codigo
// gerado/minificado (bundle de service worker, arquivo ofuscado) e limpeza inofensiva
// (unsubscribe, video.play(), localStorage, JSON.parse de preferencia local).

import { type Finding } from '../domain/findings';

const EMPTY_CATCH_RE = /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g;
const EMPTY_PROMISE_CATCH_RE = /\.catch\(\s*(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>\s*\{\s*\}\s*\)/g;

// Operacoes cuja falha e rotineira e sem consequencia: ignorar o erro e a decisao correta.
const HARMLESS_OPERATION =
  /unsubscribe|\bunsub\w*\s*\(|removeEventListener|\.play\s*\(|\.pause\s*\(|localStorage|sessionStorage|JSON\.parse|\.disconnect\s*\(|\.close\s*\(|revokeObjectURL|removeChild|\.remove\s*\(|fonts\??\.ready|\.focus\s*\(|\.blur\s*\(|scrollTo|scrollIntoView|clipboard|vibrate|requestFullscreen|exitFullscreen|signOut|addIceCandidate|replaceTrack|\.stop\s*\(|\.abort\s*\(/i;

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

/** Bundle/minificado: uma linha enorme nao e codigo escrito a mao. */
function looksGenerated(content: string): boolean {
  return content.split('\n').some((l) => l.length > 800);
}

/** Corpo do `try { ... }` que antecede o `catch` em `catchIndex` (balanceando chaves). */
function tryBodyBefore(content: string, catchIndex: number): string {
  let i = catchIndex - 1;
  while (i >= 0 && /\s/.test(content[i] ?? '')) {
    i--;
  }
  if (content[i] !== '}') {
    return '';
  }
  let depth = 0;
  for (let j = i; j >= 0; j--) {
    const ch = content[j];
    if (ch === '}') {
      depth++;
    } else if (ch === '{') {
      depth--;
      if (depth === 0) {
        return content.slice(j, i + 1);
      }
    }
  }
  return '';
}

/** Trecho da cadeia de promise antes de `.catch(...)`: do inicio do statement ate o .catch. */
function statementBefore(content: string, index: number): string {
  const start = Math.max(
    0,
    content.lastIndexOf(';', index - 1),
    content.lastIndexOf('}', index - 1)
  );
  return content.slice(start, index);
}

export function detectSwallowedErrors(files: Array<{ path: string; content: string }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!/\.(?:m|c)?[jt]sx?$/.test(file.path) || looksGenerated(file.content)) {
      continue;
    }
    for (const re of [EMPTY_CATCH_RE, EMPTY_PROMISE_CATCH_RE]) {
      re.lastIndex = 0;
      const isTryCatch = re === EMPTY_CATCH_RE;
      let m: RegExpExecArray | null;
      while ((m = re.exec(file.content)) !== null) {
        const context = isTryCatch
          ? tryBodyBefore(file.content, m.index)
          : statementBefore(file.content, m.index);
        if (HARMLESS_OPERATION.test(context)) {
          continue;
        }
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
