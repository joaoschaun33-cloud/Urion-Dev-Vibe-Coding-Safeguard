// bin/lib/mode-maker.cjs

const fs = require('node:fs');
const path = require('node:path');
const ui = require('./ui-kit.cjs');
const { colors } = ui;

function colorize(text, colorName) {
  const code = colors[colorName] || colors.reset;
  return `${code}${text}${colors.reset}`;
}

// FONTE UNICA: as regras vem do arquivo gerado a partir do dominio TS
// (src/features/security-audit/domain/vibe-guard-rules.ts). Regenere com
// `npm run sync:rules:guard`. NAO redefina regras aqui (Dogma: fonte unica).
const { VIBE_GUARD_RULES, PROVIDER_TOKEN_SOURCE } = require('./vibe-guard-rules.generated.cjs');

// Espelho de src/features/security-audit/domain/scan-filters.ts (reduz falso positivo).
const TEST_OR_FIXTURE_RE =
  /\.(?:test|spec)\.[cm]?[jt]sx?$|(?:^|[\\/])(?:__mocks__|__fixtures__|__tests__|fixtures|mocks)[\\/]/i;
const MOCK_VALUE_RE =
  /\b(?:mock|fake|dummy|example|exemplo|placeholder|changeme|your[_-]?(?:api[_-]?)?key|test[_-]?key|xxx+)/i;

// ESPELHO de src/features/security-audit/domain/env-secrets.ts (segredos em .env, formato
// NOME=valor sem aspas). Mantenha em sincronia: env-secrets.test.ts roda as duas versoes.
const PROVIDER_TOKEN = new RegExp(PROVIDER_TOKEN_SOURCE);
const ENV_PUBLIC_PREFIX = /^(?:VITE_|NEXT_PUBLIC_|REACT_APP_|PUBLIC_|EXPO_PUBLIC_|NUXT_PUBLIC_|GATSBY_)/;
const ENV_PUBLIC_WORD = /(?:PUBLIC|PUBLISHABLE|ANON)/i;
const ENV_SECRET_NAME =
  /(?:SECRET|SERVICE_?ROLE|PRIVATE|PASSWORD|PASSWD|PWD|TOKEN|API_?KEY|ACCESS_?KEY|AUTH_?KEY|CREDENTIAL|SIGNING|ENCRYPTION)/i;
const ENV_CONNECTION_NAME = /(?:DATABASE_URL|DB_URL|REDIS_URL|DSN|MONGO\w*|\w*_URI|\w*_URL)$/i;
const ENV_CREDS_IN_URL = /^[a-z][a-z0-9+.-]*:\/\/[^/\s:@]+:[^@\s]+@/i;
const ENV_PLACEHOLDER = /^(?:true|false|null|undefined|\d+|localhost.*|your[_-].*|<.*>|\$\{.*\}|change.?me|x{3,}|\*+|todo)$/i;
const ENV_SAFE_SUFFIX = /\.(?:example|sample|template|dist|tpl)$/i;

function isEnvFileName(name) {
  const base = String(name).split(/[\\/]/).pop() || String(name);
  if (ENV_SAFE_SUFFIX.test(base)) return false;
  return /^\.env(?:\..+)?$/i.test(base) || /\.env$/i.test(base);
}

function cleanEnvValue(raw) {
  let v = raw.trim();
  const quote = v[0];
  if (quote === '"' || quote === "'") {
    const end = v.indexOf(quote, 1);
    return end > 0 ? v.slice(1, end) : v.slice(1);
  }
  const hash = v.search(/\s#/);
  if (hash >= 0) v = v.slice(0, hash);
  return v.trim();
}

function findEnvSecrets(content) {
  const hits = [];
  content.split('\n').forEach((rawLine, index) => {
    const line = rawLine.replace(/\r$/, '').trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq <= 0) return;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, '');
    if (!/^[A-Za-z_][A-Za-z0-9_.]*$/.test(key)) return;
    const value = cleanEnvValue(line.slice(eq + 1));
    if (!value || ENV_PLACEHOLDER.test(value) || MOCK_VALUE_RE.test(value)) return;

    let secret = PROVIDER_TOKEN.test(value);
    if (!secret && !ENV_PUBLIC_PREFIX.test(key) && !ENV_PUBLIC_WORD.test(key)) {
      if (ENV_CONNECTION_NAME.test(key) && ENV_CREDS_IN_URL.test(value)) secret = true;
      else if (ENV_SECRET_NAME.test(key) && value.length >= 8) secret = true;
    }
    if (secret) hits.push({ line: index + 1, key });
  });
  return hits;
}

// ESPELHOS de src/features/security-audit/domain/scan-filters.ts e scan-vibe-guard.ts
// (teste de paridade em scan-filters-mirror.test.ts).
function looksGeneratedContent(content) {
  return content.length > 200 * 1024 || content.split('\n').some((l) => l.length > 1000);
}
const FIREBASE_SIBLING = /\b(?:authDomain|messagingSenderId|storageBucket|measurementId|databaseURL|appId)\b/;
function isFirebaseWebConfigLine(lines, index) {
  const from = Math.max(0, index - 8);
  const to = Math.min(lines.length, index + 9);
  return /\bapiKey\b/.test(lines[index] || '') && lines.slice(from, to).some((l) => FIREBASE_SIBLING.test(l));
}
function isStaticMultilineTemplate(lines, index) {
  const line = lines[index] || '';
  const open = line.indexOf('`');
  if (open < 0 || line.indexOf('`', open + 1) >= 0) return false;
  let body = line.slice(open + 1);
  for (let i = index + 1; i < Math.min(lines.length, index + 2000); i++) {
    const next = lines[i] || '';
    const close = next.indexOf('`');
    if (close >= 0) {
      body += `\n${next.slice(0, close)}`;
      return !body.includes('${');
    }
    body += `\n${next}`;
  }
  return false;
}
const GLOBAL_LIMITER_RE = /\.use\(\s*(?:['"`][^'"`]*['"`]\s*,\s*)?[^)]*\b\w*(?:limiter|ratelimit)\w*/i;

// Varredura pura (sem console): e o que o comando `vibeguard` executa e o que o
// benchmark (benchmarks/) mede — a mesma funcao, nao uma copia da logica.
function scanProject(targetDir) {
  let issues = [];
  let hasGlobalLimiter = false;
  const unreadable = [];
  const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.urion', '.next', 'coverage']);
  const allowedExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.cjs']);
  let scannedFiles = 0;

  function scan(currentDir) {
    let list = [];
    try { list = fs.readdirSync(currentDir); } catch { return; }

    for (const item of list) {
      const fullPath = path.join(currentDir, item);
      let stat;
      try { stat = fs.statSync(fullPath); } catch { continue; }

      if (stat.isDirectory()) {
        // Pastas ocultas (.vite, .cache, .turbo...) sao cache/gerado, nao o codigo do projeto.
        if (!ignoreDirs.has(item) && !item.startsWith('.')) scan(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        const relForFilter = path.relative(targetDir, fullPath);
        const isEnv = isEnvFileName(item);
        if ((allowedExts.has(ext) || isEnv) && !TEST_OR_FIXTURE_RE.test(relForFilter)) {
          scannedFiles++;
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            const relFile = path.relative(targetDir, fullPath).replace(/\\/g, '/');
            // Bundle/minificado: so procura segredo ali (alta confianca), nunca XSS/SQL/etc. (ruido).
            const generated = !isEnv && looksGeneratedContent(content);
            if (isEnv) {
              // .env: so a logica propria (respeita variaveis publicas VITE_*/NEXT_PUBLIC_*).
              // As regexes de codigo nao se aplicam: acusariam chave publica entre aspas.
              const secretRule = VIBE_GUARD_RULES.find((r) => r.id === 'SECRETS_HARDCODED');
              for (const hit of findEnvSecrets(content)) {
                issues.push({ rule: secretRule, file: relFile, line: hit.line, snippet: `${hit.key}=***` });
              }
            } else {
              lines.forEach((line, index) => {
                if (GLOBAL_LIMITER_RE.test(line)) hasGlobalLimiter = true;
                for (const rule of VIBE_GUARD_RULES) {
                  if (generated && rule.id !== 'SECRETS_HARDCODED') continue;
                  if (rule.regex.test(line)) {
                    if (
                      rule.id === 'SECRETS_HARDCODED' &&
                      (MOCK_VALUE_RE.test(line) || isFirebaseWebConfigLine(lines, index))
                    ) {
                      continue;
                    }
                    if (rule.id === 'XSS_UNSANITIZED' && isStaticMultilineTemplate(lines, index)) continue;
                    issues.push({ rule, file: relFile, line: index + 1, snippet: line.trim() });
                  }
                }
              });
            }
          } catch (err) {
            unreadable.push(`Não foi possível ler "${fullPath}": ${err.message}`);
          }
        }
      }
    }
  }

  scan(targetDir);
  // Limitador global (app.use(limiter)) protege as rotas de login que a regex por linha nao liga a ele.
  if (hasGlobalLimiter) issues = issues.filter((i) => i.rule.id !== 'RATE_LIMIT_MISSING');
  return { issues, scannedFiles, unreadable };
}

function runModeMakerScanner(targetDir = process.cwd()) {
  console.log(ui.box('🛡️ URION VIBEGUARD v2.0 — MODO MAKER', [
    'Diagnóstico em Linguagem Simples para Criadores (No-Code / Low-Code)',
    'Análise das 5 Vulnerabilidades Críticas de Aplicativos Gerados por IA'
  ], 75));
  console.log(colorize('\n🔍 Escaneando vulnerabilidades que ameaçam seu aplicativo...\n', 'yellow'));

  const { issues, scannedFiles, unreadable } = scanProject(targetDir);
  unreadable.forEach((msg) => console.warn(`⚠️  ${msg}`));

  const criticals = issues.filter(i => i.rule.severity === 'CRITICAL').length;
  const warnings = issues.filter(i => i.rule.severity === 'WARNING').length;

  let score = 100 - (criticals * 20) - (warnings * 5);
  if (score < 0) score = 0;

  console.log(colorize(`📊 DIAGNÓSTICO DE SEGURANÇA PARA MAKERS:`, 'bright'));
  console.log(ui.progressBar('Score', score, 30));

  if (score >= 90 && criticals === 0) {
    console.log(colorize('\n✅ Nenhum dos 5 padrões de risco que este scanner procura foi encontrado.', 'green'));
    console.log(colorize('⚠️  Isso NÃO prova que o app é seguro: a análise usa regras simples e, em testes internos,', 'yellow'));
    console.log(colorize('   deixa passar boa parte dos casos vulneráveis. Antes de lançar (principalmente com', 'yellow'));
    console.log(colorize('   pagamentos ou dados pessoais), peça uma revisão humana. Detalhes: benchmarks/RESULTS.md\n', 'yellow'));
  } else if (score >= 70) {
    console.log(colorize('\n🟡 ATENÇÃO: Seu app funciona, mas exige pequenos ajustes antes do lançamento.', 'yellow'));
  } else {
    console.log(colorize('\n🔴 RISCO CRÍTICO: Seu app tem portas abertas para invasão imediata!', 'red'));
  }

  console.log(colorize(`\n📁 Arquivos analisados: ${scannedFiles}`, 'dim'));
  console.log(colorize(`🚨 Problemas encontrados: ${issues.length} (${criticals} críticos, ${warnings} alertas)\n`, 'bright'));

  if (issues.length > 0) {
    console.log(colorize('============================================================', 'cyan'));
    issues.forEach((item, idx) => {
      const badge = item.rule.severity === 'CRITICAL' ? colorize('[🔴 RISCO ALTO]', 'red') : colorize('[🟡 ALERTA]', 'yellow');
      console.log(`\n${idx + 1}. ${badge} ${colorize(item.rule.title, 'bright')}`);
      console.log(`   📍 Onde: ${colorize(`${item.file}:${item.line}`, 'cyan')}`);
      console.log(`   💡 O que é: ${item.rule.descriptionLeiga}`);
      console.log(`   💣 Risco Real: ${item.rule.riscoReal}`);
      console.log(`   🛠️ Como resolver: ${item.rule.recomendacaoLeiga}`);
    });
    console.log(colorize('\n============================================================', 'cyan'));
  }

  return { score, criticals, warnings, issuesCount: issues.length };
}

module.exports = { runModeMakerScanner, scanProject, findEnvSecrets, isEnvFileName, VIBE_GUARD_RULES };
