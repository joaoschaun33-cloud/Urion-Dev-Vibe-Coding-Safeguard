// src/features/security-audit/application/detect-unvalidated-write.ts
// Detector PURO: req.body jogado direto num write de ORM sem validacao de
// schema aparente (R7). Escopo deliberadamente restrito ao padrao mais obvio
// (data: req.body / data: {...req.body}) para manter falso-positivo baixo —
// isto NAO detecta toda falta de validacao, so o caso mais preguicoso.

import { type Finding } from '../domain/findings';

const UNVALIDATED_WRITE_RE =
  /\.(?:create|update|updateMany|upsert)\(\s*\{\s*(?:where\s*:\s*[^,]+,\s*)?data\s*:\s*(?:\.\.\.)?req\.body\b/g;
const VALIDATION_HINT_RE = /\.parse\(|\.safeParse\(|joi\.object|yup\.object|\.validate\(/i;

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function detectUnvalidatedWrite(files: Array<{ path: string; content: string }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!/\.(?:m|c)?[jt]sx?$/.test(file.path)) {
      continue;
    }
    // Se ha qualquer chamada de validacao em algum lugar do arquivo, assume-se
    // (conservador) que o body pode ter sido validado antes de chegar aqui.
    if (VALIDATION_HINT_RE.test(file.content)) {
      continue;
    }
    const re = new RegExp(UNVALIDATED_WRITE_RE);
    let m: RegExpExecArray | null;
    while ((m = re.exec(file.content)) !== null) {
      findings.push({
        ruleId: 'BODY_UNVALIDATED_WRITE',
        severity: 'WARNING',
        file: file.path,
        line: lineOf(file.content, m.index),
        message:
          'req.body passado direto para escrita no banco, sem validacao de schema no arquivo.',
        remediation:
          'Valide o corpo da requisicao com Zod/Joi/Yup antes de gravar (ex.: const data = schema.parse(req.body)) — sem isso, o cliente decide quais campos escrever no banco.',
      });
    }
  }

  return findings;
}
