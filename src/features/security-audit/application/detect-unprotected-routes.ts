// src/features/security-audit/application/detect-unprotected-routes.ts
// Detector PURO: rotas Express sensiveis sem middleware de auth aparente (R1).
// Heuristica conservadora (so paths sensiveis) + opt-out via "// PUBLIC:".

import { type Finding } from '../domain/findings';

const ROUTE_RE = /\b(?:app|router)\.(?:get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)[`'"]/i;
const SENSITIVE = /(admin|users?|accounts?|profile|orders?|payments?|billing|settings|\/me\b)/i;
const AUTH_HINT =
  /(auth|authenticate|authmiddleware|requireauth|requireuser|ensureauth|isauthenticated|verifytoken|passport|guard)/i;
const PUBLIC_MARK = /\/\/\s*public/i;

export function detectUnprotectedRoutes(
  files: Array<{ path: string; content: string }>
): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!/\.(?:m|c)?[jt]sx?$/.test(file.path)) {
      continue;
    }
    const lines = file.content.split('\n');
    lines.forEach((line, i) => {
      const m = ROUTE_RE.exec(line);
      if (!m) {
        return;
      }
      const routePath = m[1];
      if (!SENSITIVE.test(routePath)) {
        return;
      }
      const context = `${line} ${lines[i + 1] ?? ''}`;
      const prev = lines[i - 1] ?? '';
      if (AUTH_HINT.test(context)) {
        return;
      }
      if (PUBLIC_MARK.test(line) || PUBLIC_MARK.test(prev)) {
        return;
      }
      findings.push({
        ruleId: 'ROUTE_NO_AUTH',
        severity: 'CRITICAL',
        file: file.path,
        line: i + 1,
        message: `Rota sensivel "${routePath}" sem middleware de autenticacao aparente.`,
        remediation:
          'Adicione middleware de auth (ex.: requireAuth) ou, se for publica de proposito, marque com "// PUBLIC: motivo".',
      });
    });
  }

  return findings;
}
