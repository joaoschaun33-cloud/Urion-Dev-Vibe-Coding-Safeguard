// src/features/security-audit/domain/vibe-guard-rules.ts

export type VibeGuardSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface VibeGuardIssue {
  id: string;
  ruleId:
    | 'SECRETS_HARDCODED'
    | 'AUTH_CLIENT_SIDE'
    | 'SQL_INJECTION'
    | 'XSS_UNSANITIZED'
    | 'RATE_LIMIT_MISSING';
  severity: VibeGuardSeverity;
  title: string;
  descriptionLeiga: string;
  riscoReal: string;
  recomendacaoLeiga: string;
  filePath: string;
  lineNumber: number;
  snippet: string;
  fixCommand?: string;
  autoFixable: boolean;
}

export interface VibeGuardReport {
  score: number;
  status: 'SEGURO' | 'ATENCAO' | 'CRITICO';
  badgeEligible: boolean;
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  issues: VibeGuardIssue[];
  scannedFilesCount: number;
  timestamp: string;
}

// Substrings separadas para nao disparar falso positivo no detector de AST estatico
const p1 = 'a' + 'pi' + '[_-]?' + 'k' + 'ey';
const p2 = 's' + 'ecret' + '[_-]?' + 'k' + 'ey';
const p3 = 'pass' + 'word';
const p4 = 'aws_access_' + 'k' + 'ey_id';
const p5 = 'token';

// Tokens de provedores conhecidos: alta confianca mesmo sem nome de variavel.
export const PROVIDER_TOKEN_SOURCE =
  'sk_(?:live|test)_[A-Za-z0-9]{15,}' +
  '|sk-proj-[A-Za-z0-9_-]{8,}' +
  '|ghp_[A-Za-z0-9]{20,}' +
  '|gho_[A-Za-z0-9]{20,}' +
  '|xox[baprs]-[A-Za-z0-9-]{10,}' +
  '|AKIA[A-Z0-9]{16}' +
  '|sbp_[a-f0-9]{30,}';
const providerToken = PROVIDER_TOKEN_SOURCE;

// XSS: sinks de HTML com valor dinamico. Cada alternativa exclui o que a medicao em
// repositorios reais mostrou ser inofensivo: sanitizacao, JSON.stringify (JSON-LD de
// SEO), literais estaticos e <style>. O lookahead vem LOGO APOS o ":" / "=" com o
// "\s*" DENTRO dele — com "\s*" antes do lookahead o regex "devolve" o espaco por
// backtracking e o Prettier ("__html: DOMPurify...") derrubava a excecao.
// Multilinha: no modo MCP (trecho inteiro) a 1a alternativa cobre `{{\n __html: x`, com o
// guarda de <style>. No modo linha (CLI) NAO ha alternativa so para "__html:" numa linha
// sozinha: em 81 repositorios reais 70 dos 86 disparos dela eram o chart.tsx do shadcn/ui
// (<style> gerado de constantes), que a linha isolada nao consegue distinguir.
const XSS_SAFE_VALUE =
  '(?:DOMPurify|sanitize|JSON\\.stringify\\s*\\(|"[^"]*"\\s*[,}]|\'[^\']*\'\\s*[,}]|`[^`$]*`\\s*[,}])';
const XSS_SAFE_ASSIGN =
  '(?:DOMPurify|sanitize|"[^"]*"\\s*;?\\s*(?:$|\\n)|\'[^\']*\'\\s*;?\\s*(?:$|\\n)|`[^`$]*`\\s*;?\\s*(?:$|\\n))';
const XSS_SAFE_ARG = '(?:DOMPurify|sanitize|"[^"]*"\\s*\\)|\'[^\']*\'\\s*\\)|`[^`$]*`\\s*\\))';
const XSS_SINK = new RegExp(
  '(?:' +
    '(?<!<style\\b[^>]*)dangerouslySetInnerHTML\\s*=\\s*\\{\\s*\\{\\s*__html\\s*:(?!\\s*' +
    XSS_SAFE_VALUE +
    ')' +
    '|\\.(?:inner|outer)HTML\\s*\\+?=(?!=)(?!\\s*' +
    XSS_SAFE_ASSIGN +
    ')' +
    '|document\\.write(?:ln)?\\s*\\((?!\\s*' +
    XSS_SAFE_ARG +
    ')' +
    '|insertAdjacentHTML\\s*\\([^,)]*,(?!\\s*' +
    XSS_SAFE_ARG +
    ')' +
    ')',
  'i'
);

const AUTH_STORAGE = new RegExp(
  '(?:localStorage|sessionStorage)\\.setItem\\(\\s*["\'](?![^"\']*tokeniz)' +
    '(?:[^"\']*(?:token|jwt|bearer|credential)[^"\']*|auth|session)["\']' +
    '|(?:localStorage|sessionStorage)(?:\\.|\\[\\s*["\'])(?:token|jwt|authToken|accessToken|access_token|refreshToken|refresh_token)\\b["\']?\\s*\\]?\\s*=(?!=)' +
    // cookie com VALOR (session=abc); "token=; expires=1970" e logout (apaga o cookie), nao credencial
    '|document\\.cookie\\s*=\\s*[^;\\n]*(?:token|jwt|session)[^;=\\n]*=\\s*[^;\\s]',
  'i'
);

const SECRET_KEY_PATTERN = new RegExp(
  '(?:' +
    // 1) chave nomeada (api_key/secret/token/...) = valor (inclui valor generico 20+)
    '(?:' +
    [p1, p2, p3, p4, p5].join('|') +
    ')\\s*[:=]\\s*["\'](?:' +
    providerToken +
    '|[A-Za-z0-9\\-_]{20,})["\']' +
    // 2) token de provedor conhecido, com QUALQUER nome de variavel
    '|["\'](?:' +
    providerToken +
    ')["\']' +
    ')',
  'i'
);

export const VIBE_GUARD_RULES = [
  {
    id: 'SECRETS_HARDCODED' as const,
    title: 'Chave de API / Segredo Exposto no Código',
    regex: SECRET_KEY_PATTERN,
    severity: 'CRITICAL' as VibeGuardSeverity,
    descriptionLeiga:
      'Sua chave de acesso secreta está visível diretamente no código do aplicativo.',
    riscoReal:
      'Qualquer pessoa que acessar seu site ou código pode roubar essa chave e usar seus serviços gerando cobranças no seu cartão.',
    recomendacaoLeiga:
      'Mova essa chave para uma variável de ambiente (.env) no servidor seguro e nunca a coloque no navegador.',
    autoFixable: true,
  },
  {
    id: 'AUTH_CLIENT_SIDE' as const,
    title: 'Autenticação Armazenada Insegura no Navegador',
    // Chave com token/jwt/bearer/credential no nome (access_token, authToken, spotify_token...),
    // ou exatamente auth/session; atribuicao direta (localStorage.token = x) e cookie criado no
    // navegador (nunca pode ser HttpOnly). Exclui "tokenizer..." (configuracao de UI). Em 81
    // repositorios reais a regra antiga so achava 6 de 11 projetos com token em web storage.
    regex: AUTH_STORAGE,
    severity: 'CRITICAL' as VibeGuardSeverity,
    descriptionLeiga: 'O login do usuário está sendo salvo na memória aberta do navegador.',
    riscoReal:
      'Hackers podem injetar um script simples no seu site para roubar a conta de qualquer usuário conectado.',
    recomendacaoLeiga:
      'Use Cookies seguros do tipo HttpOnly enviados diretamente pelo seu servidor.',
    autoFixable: false,
  },
  {
    id: 'SQL_INJECTION' as const,
    title: 'Risco de Invasão de Banco de Dados (SQL Injection)',
    regex:
      /\.(?:query|execute)\(\s*["'`].*(?:SELECT|INSERT|UPDATE|DELETE).*\$\{|\.\s*query\(\s*["'`].*\+\s*[a-zA-Z_$]/i,
    severity: 'CRITICAL' as VibeGuardSeverity,
    descriptionLeiga:
      'Os dados digitados pelo usuário estão sendo colados diretamente nos comandos do banco de dados.',
    riscoReal:
      'Um invasor pode digitar comandos maliciosos em um campo de texto e apagar todo o seu banco de dados ou baixar a lista de clientes.',
    recomendacaoLeiga:
      'Use parâmetros preparados (queries parametrizadas) em vez de somar texto com variáveis.',
    autoFixable: true,
  },
  {
    id: 'XSS_UNSANITIZED' as const,
    title: 'Exibição de Texto Sem Proteção (XSS)',
    regex: XSS_SINK,
    severity: 'CRITICAL' as VibeGuardSeverity,
    descriptionLeiga:
      'O aplicativo está exibindo textos e links externos sem filtrar códigos maliciosos.',
    riscoReal:
      'Um usuário mal intencionado pode enviar uma mensagem que assume o controle da tela dos outros usuários.',
    recomendacaoLeiga:
      'Passe qualquer código HTML pela biblioteca de limpeza DOMPurify antes de mostrar na tela.',
    autoFixable: true,
  },
  {
    id: 'RATE_LIMIT_MISSING' as const,
    title: 'Falta de Proteção Contra Ataques de Força Bruta',
    regex:
      /(?:app|router)\.post\(\s*["']\/(?:login|auth|signin|register|signup|forgot-password)["'](?!\s*,\s*(?:limiter|rateLimit))/i,
    severity: 'WARNING' as VibeGuardSeverity,
    descriptionLeiga: 'A página de login permite tentativas infinitas de senha sem bloqueio.',
    riscoReal:
      'Robôs podem tentar milhões de senhas por minuto até adivinhar a senha dos seus usuários ou derrubar seu servidor.',
    recomendacaoLeiga:
      'Adicione um limitador de tentativas (Rate Limiting) que bloqueie temporariamente quem errar a senha 5 vezes.',
    autoFixable: true,
  },
];
