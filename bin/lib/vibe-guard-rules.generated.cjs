// bin/lib/vibe-guard-rules.generated.cjs
// ARQUIVO GERADO AUTOMATICAMENTE — NAO EDITE A MAO.
// Fonte: src/features/security-audit/domain/vibe-guard-rules.ts
// Regenere com: npm run sync:rules:guard

const VIBE_GUARD_RULES = [
  {
    id: "SECRETS_HARDCODED",
    title: "Chave de API / Segredo Exposto no Código",
    regex: new RegExp("(?:(?:api[_-]?key|secret[_-]?key|password|aws_access_key_id|token)\\s*[:=]\\s*[\"'](?:sk_(?:live|test)_[A-Za-z0-9]{15,}|sk-proj-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[A-Z0-9]{16}|[A-Za-z0-9\\-_]{20,})[\"']|[\"'](?:sk_(?:live|test)_[A-Za-z0-9]{15,}|sk-proj-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[A-Z0-9]{16})[\"'])", "i"),
    severity: "CRITICAL",
    descriptionLeiga: "Sua chave de acesso secreta está visível diretamente no código do aplicativo.",
    riscoReal: "Qualquer pessoa que acessar seu site ou código pode roubar essa chave e usar seus serviços gerando cobranças no seu cartão.",
    recomendacaoLeiga: "Mova essa chave para uma variável de ambiente (.env) no servidor seguro e nunca a coloque no navegador.",
    autoFixable: true,
  },
  {
    id: "AUTH_CLIENT_SIDE",
    title: "Autenticação Armazenada Insegura no Navegador",
    regex: new RegExp("(?:localStorage|sessionStorage)\\.setItem\\(\\s*[\"'](?:token|jwt|auth|accessToken|session)[\"']", "i"),
    severity: "CRITICAL",
    descriptionLeiga: "O login do usuário está sendo salvo na memória aberta do navegador.",
    riscoReal: "Hackers podem injetar um script simples no seu site para roubar a conta de qualquer usuário conectado.",
    recomendacaoLeiga: "Use Cookies seguros do tipo HttpOnly enviados diretamente pelo seu servidor.",
    autoFixable: false,
  },
  {
    id: "SQL_INJECTION",
    title: "Risco de Invasão de Banco de Dados (SQL Injection)",
    regex: new RegExp("\\.(?:query|execute)\\(\\s*[\"'`].*(?:SELECT|INSERT|UPDATE|DELETE).*\\$\\{|\\.\\s*query\\(\\s*[\"'`].*\\+\\s*[a-zA-Z_$]", "i"),
    severity: "CRITICAL",
    descriptionLeiga: "Os dados digitados pelo usuário estão sendo colados diretamente nos comandos do banco de dados.",
    riscoReal: "Um invasor pode digitar comandos maliciosos em um campo de texto e apagar todo o seu banco de dados ou baixar a lista de clientes.",
    recomendacaoLeiga: "Use parâmetros preparados (queries parametrizadas) em vez de somar texto com variáveis.",
    autoFixable: true,
  },
  {
    id: "XSS_UNSANITIZED",
    title: "Exibição de Texto Sem Proteção (XSS)",
    regex: new RegExp("dangerouslySetInnerHTML\\s*=\\s*\\{\\s*\\{\\s*__html\\s*:\\s*(?!DOMPurify|sanitize)", "i"),
    severity: "CRITICAL",
    descriptionLeiga: "O aplicativo está exibindo textos e links externos sem filtrar códigos maliciosos.",
    riscoReal: "Um usuário mal intencionado pode enviar uma mensagem que assume o controle da tela dos outros usuários.",
    recomendacaoLeiga: "Passe qualquer código HTML pela biblioteca de limpeza DOMPurify antes de mostrar na tela.",
    autoFixable: true,
  },
  {
    id: "RATE_LIMIT_MISSING",
    title: "Falta de Proteção Contra Ataques de Força Bruta",
    regex: new RegExp("(?:app|router)\\.post\\(\\s*[\"']\\/(?:login|auth|signin|register|signup|forgot-password)[\"'](?!\\s*,\\s*(?:limiter|rateLimit))", "i"),
    severity: "WARNING",
    descriptionLeiga: "A página de login permite tentativas infinitas de senha sem bloqueio.",
    riscoReal: "Robôs podem tentar milhões de senhas por minuto até adivinhar a senha dos seus usuários ou derrubar seu servidor.",
    recomendacaoLeiga: "Adicione um limitador de tentativas (Rate Limiting) que bloqueie temporariamente quem errar a senha 5 vezes.",
    autoFixable: true,
  },
];

module.exports = { VIBE_GUARD_RULES };
