// src/features/security-audit/domain/env-secrets.ts
// Segredos em arquivos .env (formato NOME=valor, normalmente SEM aspas). Puro (dominio).
// ESPELHADO em bin/lib/mode-maker.cjs (CLI zero-install): mantenha em sincronia — o
// teste env-secrets.test.ts roda as duas implementacoes nas mesmas entradas.
//
// Por que existe: o scanner por linha exige aspas ("chave = 'valor'"), que .env nao
// usa, e ainda nunca lia esses arquivos (path.extname('.env') === ''). Em 81 repositorios
// reais, 6 .env versionados tinham segredo e o vibeguard viu 0.

import { PROVIDER_TOKEN_SOURCE } from './vibe-guard-rules';
import { looksLikeMockValue } from './scan-filters';

const PROVIDER_TOKEN = new RegExp(PROVIDER_TOKEN_SOURCE);

// Variaveis que o framework expoe ao navegador: publicas por definicao.
const PUBLIC_PREFIX =
  /^(?:VITE_|NEXT_PUBLIC_|REACT_APP_|PUBLIC_|EXPO_PUBLIC_|NUXT_PUBLIC_|GATSBY_)/;
const PUBLIC_WORD = /(?:PUBLIC|PUBLISHABLE|ANON)/i;
const SECRET_NAME =
  /(?:SECRET|SERVICE_?ROLE|PRIVATE|PASSWORD|PASSWD|PWD|TOKEN|API_?KEY|ACCESS_?KEY|AUTH_?KEY|CREDENTIAL|SIGNING|ENCRYPTION)/i;
const CONNECTION_NAME = /(?:DATABASE_URL|DB_URL|REDIS_URL|DSN|MONGO\w*|\w*_URI|\w*_URL)$/i;
const CREDS_IN_URL = /^[a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:[^@\s]+@/i;
const PLACEHOLDER =
  /^(?:true|false|null|undefined|\d+|localhost.*|your[_-].*|<.*>|\$\{.*\}|change.?me|x{3,}|\*+|todo)$/i;
const SAFE_SUFFIX = /\.(?:example|sample|template|dist|tpl)$/i;

/** true para .env, .env.local, .env.production, nome.env — exceto .env.example e afins. */
export function isEnvFileName(name: string): boolean {
  const base = name.split(/[\\/]/).pop() ?? name;
  if (SAFE_SUFFIX.test(base)) {
    return false;
  }
  return /^\.env(?:\..+)?$/i.test(base) || /\.env$/i.test(base);
}

export interface EnvSecretHit {
  line: number;
  key: string;
}

function cleanValue(raw: string): string {
  let v = raw.trim();
  const quote = v[0];
  if (quote === '"' || quote === "'") {
    const end = v.indexOf(quote, 1);
    return end > 0 ? v.slice(1, end) : v.slice(1);
  }
  const hash = v.search(/\s#/);
  if (hash >= 0) {
    v = v.slice(0, hash);
  }
  return v.trim();
}

/** Linhas de um .env que parecem segredo REAL (nao publico, nao vazio, nao placeholder). */
export function findEnvSecrets(content: string): EnvSecretHit[] {
  const hits: EnvSecretHit[] = [];
  content.split('\n').forEach((rawLine, index) => {
    const line = rawLine.replace(/\r$/, '').trim();
    if (!line || line.startsWith('#')) {
      return;
    }
    const eq = line.indexOf('=');
    if (eq <= 0) {
      return;
    }
    const key = line
      .slice(0, eq)
      .trim()
      .replace(/^export\s+/, '');
    if (!/^[A-Za-z_][A-Za-z0-9_.]*$/.test(key)) {
      return;
    }
    const value = cleanValue(line.slice(eq + 1));
    if (!value || PLACEHOLDER.test(value) || looksLikeMockValue(value)) {
      return;
    }

    let secret = PROVIDER_TOKEN.test(value);
    if (!secret && !PUBLIC_PREFIX.test(key) && !PUBLIC_WORD.test(key)) {
      if (CONNECTION_NAME.test(key) && CREDS_IN_URL.test(value)) {
        secret = true;
      } else if (SECRET_NAME.test(key) && value.length >= 8) {
        secret = true;
      }
    }
    if (secret) {
      hits.push({ line: index + 1, key });
    }
  });
  return hits;
}
