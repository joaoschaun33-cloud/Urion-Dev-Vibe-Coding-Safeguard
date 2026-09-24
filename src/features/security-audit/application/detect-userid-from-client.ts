// src/features/security-audit/application/detect-userid-from-client.ts
// Detector PURO: userId aceito de req.body em vez de vir do token autenticado (R2).
// Escopo deliberadamente restrito a req.body (nao query/params): identificar um
// RECURSO por :id na URL e uso normal de REST; o problema real e usar um userId
// que o CLIENTE mandou no corpo da requisicao para decidir DE QUEM e a operacao
// (ex.: "crie um pedido para o userId que eu disser"), em vez do usuario logado.

import { type Finding } from '../domain/findings';

const BODY_USERID_RE =
  /req\.body\.userId\b|(?:const|let|var)\s*\{[^}]*\buserId\b[^}]*\}\s*=\s*req\.body\b/;

// Endpoint restrito a admin/autorizado (adminAuth, requireAdmin, isAdmin...): o userId no corpo e o
// alvo de uma acao administrativa legitima, nao o usuario "logado". Olha a definicao da rota
// (router.post('/x', adminAuth, ...)) que antecede a leitura do corpo. Medido: 2 de 2 alertas.
const ROUTE_DEF_RE = /\b[\w$]*(?:router|app)\.(?:get|post|put|patch|delete)\(/gi;
const ADMIN_GUARD_RE = /admin|isadmin|requirerole|authorize|hasrole|permission/i;

function routeIsAdminGuarded(content: string, index: number): boolean {
  const before = content.slice(Math.max(0, index - 1500), index);
  let last: RegExpExecArray | null = null;
  const re = new RegExp(ROUTE_DEF_RE);
  let m: RegExpExecArray | null;
  while ((m = re.exec(before)) !== null) {
    last = m;
  }
  if (!last) {
    return false;
  }
  const defLine = before.slice(last.index).split('\n')[0] ?? '';
  return ADMIN_GUARD_RE.test(defLine);
}

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function detectUserIdFromClient(files: Array<{ path: string; content: string }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!/\.(?:m|c)?[jt]sx?$/.test(file.path)) {
      continue;
    }
    const re = new RegExp(BODY_USERID_RE, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(file.content)) !== null) {
      if (routeIsAdminGuarded(file.content, m.index)) {
        continue;
      }
      findings.push({
        ruleId: 'USERID_FROM_CLIENT',
        severity: 'CRITICAL',
        file: file.path,
        line: lineOf(file.content, m.index),
        message: 'userId veio de req.body (o cliente), nao do usuario autenticado.',
        remediation:
          'Use o userId do token validado (ex.: req.user.id extraido do JWT no middleware de auth) — nunca aceite esse valor do corpo da requisicao, ou qualquer usuario pode agir como outro.',
      });
    }
  }

  return findings;
}
