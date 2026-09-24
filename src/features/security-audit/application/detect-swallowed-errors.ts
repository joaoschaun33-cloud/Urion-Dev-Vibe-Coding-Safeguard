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
import { isDevScriptPath, looksGeneratedContent } from '../domain/scan-filters';

const EMPTY_CATCH_RE = /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g;
const EMPTY_PROMISE_CATCH_RE = /\.catch\(\s*(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>\s*\{\s*\}\s*\)/g;

// Operacoes cuja falha e rotineira e sem consequencia: ignorar o erro e a decisao correta.
const HARMLESS_OPERATION =
  /unsubscribe|\bunsub\w*\s*\(|removeEventListener|\.play\s*\(|\.pause\s*\(|localStorage|sessionStorage|JSON\.parse|\.disconnect\s*\(|\.close\s*\(|revokeObjectURL|removeChild|\.remove\s*\(|fonts\??\.ready|\.focus\s*\(|\.blur\s*\(|scrollTo|scrollIntoView|clipboard|vibrate|requestFullscreen|exitFullscreen|signOut|logout|addIceCandidate|replaceTrack|\.stop\s*\(|\.abort\s*\(|navigator\.share|requestPermission|gtag|analytics|\btrack\w*\s*\(|SecureStore/i;

// Um catch vazio so importa quando o try/cadeia faz I/O cuja falha muda o resultado: rede, banco,
// pagamento, e-mail. Em 70 repositorios nunca vistos, 6 de 7 achados eram audio, limpeza de store e
// laco de tentativas: em vez de crescer a lista de "inofensivos" (nunca termina), exige evidencia de I/O.
const IO_EVIDENCE =
  /\b(?:fetch|axios|supabase|prisma|mongoose|knex|sequelize|firestore|firebase|database|db|sql|query|insert|upsert|update|delete|save|charge|payment|invoice|mail|sms|webhook|rpc|http|https|gateway|stripe|transaction)\b|\b(?:fetch|load|save|submit|upload|sync|mutate)[A-Z_]\w*\s*\(|\.(?:from|collection|doc|post|put|patch|send)\s*\(/i;

// Parse do corpo (res.json()/req.json()) so e inofensivo dentro de try/catch (corpo opcional). Numa
// cadeia de promise, fetch(...).then(r => r.json()).catch(() => {}) engole a falha da REQUISICAO — relevante.
const HARMLESS_IN_TRY = new RegExp(`${HARMLESS_OPERATION.source}|\\.json\\s*\\(\\s*\\)`, 'i');

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
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
  // Anda para tras balanceando ()/{}/[]: "; = ," so terminam o statement FORA de qualquer par (um ";"
  // dentro de .then(rows => { ...; }) nao pode cortar a cadeia antes do fetch que a inicia).
  let depth = 0;
  let i = index - 1;
  for (; i >= 0 && index - i < 4000; i--) {
    const ch = content[i];
    if (ch === ')' || ch === '}' || ch === ']') {
      depth++;
    } else if (ch === '(' || ch === '{' || ch === '[') {
      if (depth === 0) {
        break;
      }
      depth--;
    } else if (depth === 0 && (ch === ';' || ch === '=' || ch === ',')) {
      break;
    }
  }
  return content.slice(i + 1, index);
}

export function detectSwallowedErrors(files: Array<{ path: string; content: string }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (
      !/\.(?:m|c)?[jt]sx?$/.test(file.path) ||
      isDevScriptPath(file.path) ||
      looksGeneratedContent(file.content)
    ) {
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
        if ((isTryCatch ? HARMLESS_IN_TRY : HARMLESS_OPERATION).test(context)) {
          continue;
        }
        if (!IO_EVIDENCE.test(context)) {
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
