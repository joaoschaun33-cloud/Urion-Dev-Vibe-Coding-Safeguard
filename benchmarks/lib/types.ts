export const VIBEGUARD_RULES = [
  'SECRETS_HARDCODED',
  'AUTH_CLIENT_SIDE',
  'SQL_INJECTION',
  'XSS_UNSANITIZED',
  'RATE_LIMIT_MISSING',
] as const;

export const CHECKS_RULES = [
  'RLS_MISSING',
  'ROUTE_NO_AUTH',
  'ENV_NOT_IGNORED',
  'USERID_FROM_CLIENT',
  'ERROR_SWALLOWED',
  'WEBHOOK_UNVERIFIED',
  'BODY_UNVALIDATED_WRITE',
  'N_PLUS_ONE',
] as const;

export type VibeguardRule = (typeof VIBEGUARD_RULES)[number];
export type ChecksRule = (typeof CHECKS_RULES)[number];
export type EngineName = 'vibeguard' | 'checks';

export interface BenchCase {
  id: string;
  /** Por que este caso e vulneravel (ou seguro): o "gabarito" precisa de justificativa. */
  why: string;
  /** Regras que DEVEM disparar. Qualquer outra que dispare conta como falso positivo. */
  expect: { vibeguard?: VibeguardRule[]; checks?: ChecksRule[] };
  /** Caminho relativo -> conteudo. Materializado num diretorio temporario real. */
  files: Record<string, string>;
}

export interface CaseOutcome {
  id: string;
  expected: ReadonlySet<string>;
  fired: ReadonlySet<string>;
}
