// src/features/security-audit/application/detect-env-leaks.ts
// Detector PURO: arquivos .env VERSIONAVEIS que contem segredo (nao cobertos pelo .gitignore).
// Recebe os .gitignore e (opcionalmente) o conteudo dos .env (I/O fica no CLI).
//
// Medido em 81 repositorios reais: 17 de 23 alertas eram .env so com variaveis publicas
// (VITE_*), e 2 .env.production versionados com segredo NAO eram acusados porque ".env" no
// .gitignore era tratado como se cobrisse ".env.production" (o Git so ignora o nome exato).

import { type Finding } from '../domain/findings';
import { findEnvSecrets } from '../domain/env-secrets';

const SAFE_ENV = new Set(['.env.example', '.env.sample', '.env.template']);

export interface EnvLeakInput {
  /** .gitignore da raiz (compatibilidade). */
  gitignore: string;
  /** Caminhos relativos (com "/") dos arquivos .env encontrados. */
  envFiles: string[];
  /** .gitignore de subpastas: { "apps/api": "conteudo" } (a raiz pode vir aqui como ""). */
  gitignores?: Record<string, string>;
  /** Conteudo dos .env. Se ausente para um arquivo, ele e acusado (comportamento legado). */
  contents?: Record<string, string>;
}

function globToRegex(glob: string): RegExp {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i] ?? '';
    if (c === '*') {
      if (glob[i + 1] === '*') {
        re += '.*';
        i++;
        if (glob[i + 1] === '/') {
          i++;
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

interface Rule {
  negated: boolean;
  dirOnly: boolean;
  anchored: boolean;
  re: RegExp;
}

function parseGitignore(content: string): Rule[] {
  const rules: Rule[] = [];
  for (const raw of content.split('\n')) {
    let line = raw.replace(/\r$/, '').trimEnd();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const negated = line.startsWith('!');
    if (negated) {
      line = line.slice(1);
    }
    const dirOnly = line.endsWith('/');
    if (dirOnly) {
      line = line.slice(0, -1);
    }
    const anchored = line.includes('/');
    line = line.replace(/^\//, '');
    if (line) {
      rules.push({ negated, dirOnly, anchored, re: globToRegex(line) });
    }
  }
  return rules;
}

function matchesRule(rule: Rule, relPath: string): boolean {
  const segments = relPath.split('/');
  const base = segments[segments.length - 1] ?? relPath;
  if (rule.dirOnly) {
    // Pasta ignorada => tudo dentro dela. Testa cada pasta-pai.
    return segments
      .slice(0, -1)
      .some((_, i) =>
        rule.anchored
          ? rule.re.test(segments.slice(0, i + 1).join('/'))
          : rule.re.test(segments[i] ?? '')
      );
  }
  if (rule.anchored) {
    return rule.re.test(relPath);
  }
  return rule.re.test(base) || segments.slice(0, -1).some((s) => rule.re.test(s));
}

/** Semantica do Git: arquivos .gitignore da raiz ate a pasta do arquivo; a ultima regra que casa vence. */
export function isIgnoredByGitignores(
  relPath: string,
  gitignores: Record<string, string>
): boolean {
  const dirs = Object.keys(gitignores)
    .filter((d) => d === '' || relPath.startsWith(`${d}/`))
    .sort((a, b) => a.length - b.length);
  let ignored = false;
  for (const dir of dirs) {
    const sub = dir === '' ? relPath : relPath.slice(dir.length + 1);
    for (const rule of parseGitignore(gitignores[dir] ?? '')) {
      if (matchesRule(rule, sub)) {
        ignored = !rule.negated;
      }
    }
  }
  return ignored;
}

export function detectEnvLeaks(input: EnvLeakInput): Finding[] {
  const findings: Finding[] = [];
  const gitignores: Record<string, string> = { ...(input.gitignores ?? {}) };
  gitignores[''] = `${gitignores[''] ?? ''}\n${input.gitignore}`;

  for (const p of input.envFiles) {
    const base = p.split(/[\\/]/).pop() ?? p;
    if (SAFE_ENV.has(base) || isIgnoredByGitignores(p, gitignores)) {
      continue;
    }
    const content = input.contents?.[p];
    if (content !== undefined) {
      const secrets = findEnvSecrets(content);
      if (secrets.length === 0) {
        // So variaveis publicas/vazias/placeholders: versionar nao vaza segredo.
        continue;
      }
      findings.push({
        ruleId: 'ENV_NOT_IGNORED',
        severity: 'CRITICAL',
        file: p,
        message: `Arquivo "${base}" esta versionavel e contem ${String(secrets.length)} variavel(is) com aparencia de segredo (ex.: ${secrets[0]?.key ?? ''}).`,
        remediation:
          'Adicione o arquivo ao .gitignore (".env" NAO cobre ".env.local" nem ".env.production"; use ".env*"), remova-o do Git (git rm --cached) e gire os segredos que ja foram expostos.',
      });
      continue;
    }
    findings.push({
      ruleId: 'ENV_NOT_IGNORED',
      severity: 'CRITICAL',
      file: p,
      message: `Arquivo "${base}" pode ir para o Git: .env* nao esta no .gitignore.`,
      remediation: 'Adicione ".env*" ao .gitignore e remova segredos do controle de versao.',
    });
  }

  return findings;
}
