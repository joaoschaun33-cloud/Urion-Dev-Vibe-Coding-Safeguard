// src/features/security-audit/application/detect-unprotected-routes.ts
// Detector PURO: rotas Express sensiveis sem middleware de auth aparente (R1).
// Heuristica conservadora (so paths sensiveis) + opt-out via "// PUBLIC:".
//
// Medido em 81 repositorios reais: 5 de 6 alertas eram falso alarme — middleware com nome nao
// reconhecido ("protect"), auth montada em OUTRO arquivo (app.use(path, authMiddleware, route)) e a
// propria rota de login. Agora: mais nomes, router.use(auth) no arquivo, montagem em outro arquivo
// e rotas publicas por natureza.

import { type Finding } from '../domain/findings';

// Aceita qualquer identificador terminado em "app"/"router" (nao so os nomes
// literais "app"/"router") — cobre sub-routers nomeados (adminRouter,
// paymentsRouter, etc.). Mesma correcao aplicada em
// detect-unverified-webhook.ts apos achado de auditoria (2026-09-23).
const ROUTE_RE = /\b[\w$]*(?:router|app)\.(?:get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)[`'"]/i;
const SENSITIVE = /(admin|users?|accounts?|profile|orders?|payments?|billing|settings|\/me\b)/i;
const AUTH_HINT =
  /(auth|authenticate|authmiddleware|requireauth|requireuser|ensureauth|isauthenticated|verifytoken|passport|guard|protect|authorize|checkauth|requirelogin|ensureloggedin|isloggedin|withauth|jwt)/i;
const PUBLIC_MARK = /\/\/\s*public/i;
// Rotas que sao publicas por definicao (a pessoa ainda nao esta autenticada).
const PUBLIC_BY_NATURE =
  /(?:^|\/)(?:login|logout|signin|sign-in|signup|sign-up|register|callback|forgot-password|reset-password|refresh|verify-email)(?:\/|$|\?|:)/i;

const USE_RE = /\b[\w$]*(?:router|app)\.use\(\s*([^)]*)\)/i;
// app.use(path, <middleware>, router): o middleware protege o router montado (em outro arquivo).
const MOUNT_RE = /\.use\(\s*[^,()]+,\s*([^,()]*),\s*[A-Za-z_$][\w$.]*\s*\)/gi;
const IMPORT_RE = /(?:from\s+|require\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g;
// Limitadores de tentativas ("authLimiter") tem "auth" no nome mas NAO autenticam ninguem.
const LIMITER = /\b\w*(?:limit|throttle)\w*\b/gi;

function hasAuth(text: string): boolean {
  return AUTH_HINT.test(text.replace(LIMITER, ''));
}

function moduleName(p: string): string {
  const base = (p.split('/').pop() ?? p).replace(/\.(?:m|c)?[jt]sx?$/, '');
  return base === 'index' ? (p.split('/').slice(-2, -1)[0] ?? base) : base;
}

/** Nomes dos modulos importados por arquivos que montam routers atras de um middleware de auth. */
function protectedModules(files: Array<{ path: string; content: string }>): Set<string> {
  const out = new Set<string>();
  for (const f of files) {
    const mountsBehindAuth = [...f.content.matchAll(MOUNT_RE)].some((m) => hasAuth(m[1]));
    if (!mountsBehindAuth) {
      continue;
    }
    IMPORT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = IMPORT_RE.exec(f.content)) !== null) {
      out.add(moduleName(m[1]));
    }
  }
  return out;
}

export function detectUnprotectedRoutes(
  files: Array<{ path: string; content: string }>
): Finding[] {
  const findings: Finding[] = [];
  const mounted = protectedModules(files);

  for (const file of files) {
    if (!/\.(?:m|c)?[jt]sx?$/.test(file.path)) {
      continue;
    }
    if (mounted.has(moduleName(file.path))) {
      continue;
    }
    const lines = file.content.split('\n');
    // Prefixos protegidos por router.use(auth) / app.use('/api', auth) ANTES da rota, no proprio arquivo.
    const guardedPrefixes: string[] = [];
    let guardAll = false;

    lines.forEach((line, i) => {
      const use = USE_RE.exec(line);
      if (use && hasAuth(use[1])) {
        const first = /^\s*['"`]([^'"`]*)['"`]/.exec(use[1]);
        if (first) {
          guardedPrefixes.push(first[1]);
        } else {
          guardAll = true;
        }
        return;
      }
      const m = ROUTE_RE.exec(line);
      if (!m) {
        return;
      }
      const routePath = m[1];
      if (!SENSITIVE.test(routePath) || PUBLIC_BY_NATURE.test(routePath)) {
        return;
      }
      if (guardAll || guardedPrefixes.some((p) => routePath.startsWith(p))) {
        return;
      }
      const context = `${line} ${lines[i + 1] ?? ''}`;
      const prev = lines[i - 1] ?? '';
      if (hasAuth(context)) {
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
