// bin/lib/mode-maker.cjs

const fs = require('node:fs');
const path = require('node:path');
const ui = require('./ui-kit.cjs');
const { colors } = ui;

function colorize(text, colorName) {
  const code = colors[colorName] || colors.reset;
  return `${code}${text}${colors.reset}`;
}

const SECRET_KEY_PATTERN = new RegExp(
  '(?:' + 'api[_-]?key|secret|token|password|aws_access_key_id|stripe_secret_key' + ')\\s*[:=]\\s*["\'](?:sk_(?:live|test)_[A-Za-z0-9]{15,}|AKIA[A-Z0-9]{16}|[A-Za-z0-9\\-_]{20,})["\']',
  'i'
);

const VIBE_GUARD_RULES = [
  {
    id: 'SECRETS_HARDCODED',
    title: '🔑 Chave de API / Segredo Exposto no Código',
    regex: SECRET_KEY_PATTERN,
    severity: 'CRITICAL',
    descriptionLeiga: 'Sua chave de acesso secreta está visível diretamente no código do aplicativo.',
    riscoReal: 'Qualquer pessoa que acessar seu site ou código pode roubar essa chave e usar seus serviços gerando cobranças no seu cartão.',
    recomendacaoLeiga: 'Mova essa chave para uma variável de ambiente (.env) no servidor seguro e nunca a coloque no navegador.',
    autoFixable: true,
  },
  {
    id: 'AUTH_CLIENT_SIDE',
    title: '🔓 Autenticação Armazenada Insegura no Navegador',
    regex: /(?:localStorage|sessionStorage)\.setItem\(\s*["'](?:token|jwt|auth|accessToken|session)["']/i,
    severity: 'CRITICAL',
    descriptionLeiga: 'O login do usuário está sendo salvo na memória aberta do navegador.',
    riscoReal: 'Hackers podem injetar um script simples no seu site para roubar a conta de qualquer usuário conectado.',
    recomendacaoLeiga: 'Use Cookies seguros do tipo HttpOnly enviados diretamente pelo seu servidor.',
    autoFixable: false,
  },
  {
    id: 'SQL_INJECTION',
    title: '🛡️ Risco de Invasão de Banco de Dados (SQL Injection)',
    regex: /\.(?:query|execute)\(\s*["'`].*(?:SELECT|INSERT|UPDATE|DELETE).*\$\{|\.\s*query\(\s*["'`].*\+\s*[a-zA-Z_$]/i,
    severity: 'CRITICAL',
    descriptionLeiga: 'Os dados digitados pelo usuário estão sendo colados diretamente nos comandos do banco de dados.',
    riscoReal: 'Um invasor pode digitar comandos maliciosos em um campo de texto e apagar todo o seu banco de dados ou baixar a lista de clientes.',
    recomendacaoLeiga: 'Use parâmetros preparados (queries parametrizadas) em vez de somar texto com variáveis.',
    autoFixable: true,
  },
  {
    id: 'XSS_UNSANITIZED',
    title: '⚠️ Exibição de Texto Sem Proteção (XSS)',
    regex: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*(?!DOMPurify|sanitize)/i,
    severity: 'CRITICAL',
    descriptionLeiga: 'O aplicativo está exibindo textos e links externos sem filtrar códigos maliciosos.',
    riscoReal: 'Um usuário mal intencionado pode enviar uma mensagem que assume o controle da tela dos outros usuários.',
    recomendacaoLeiga: 'Passe qualquer código HTML pela biblioteca de limpeza DOMPurify antes de mostrar na tela.',
    autoFixable: true,
  },
  {
    id: 'RATE_LIMIT_MISSING',
    title: '🚦 Falta de Proteção Contra Ataques de Força Bruta',
    regex: /(?:app|router)\.post\(\s*["']\/(?:login|auth|signin|register|signup|forgot-password)["'](?!\s*,\s*(?:limiter|rateLimit))/i,
    severity: 'WARNING',
    descriptionLeiga: 'A página de login permite tentativas infinitas de senha sem bloqueio.',
    riscoReal: 'Robôs podem tentar milhões de senhas por minuto até adivinhar a senha dos seus usuários ou derrubar seu servidor.',
    recomendacaoLeiga: 'Adicione um limitador de tentativas (Rate Limiting) que bloqueie temporariamente quem errar a senha 5 vezes.',
    autoFixable: true,
  },
];

function runModeMakerScanner(targetDir = process.cwd()) {
  console.log(ui.box('🛡️ URION VIBEGUARD v2.0 — MODO MAKER', [
    'Diagnóstico em Linguagem Simples para Criadores (No-Code / Low-Code)',
    'Análise das 5 Vulnerabilidades Críticas de Aplicativos Gerados por IA'
  ], 75));
  console.log(colorize('\n🔍 Escaneando vulnerabilidades que ameaçam seu aplicativo...\n', 'yellow'));

  const issues = [];
  const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.urion', '.next', 'coverage']);
  const allowedExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.env']);
  let scannedFiles = 0;

  function scan(currentDir) {
    let list = [];
    try { list = fs.readdirSync(currentDir); } catch { return; }

    for (const item of list) {
      const fullPath = path.join(currentDir, item);
      let stat;
      try { stat = fs.statSync(fullPath); } catch { continue; }

      if (stat.isDirectory()) {
        if (!ignoreDirs.has(item)) scan(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (allowedExts.has(ext)) {
          scannedFiles++;
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              for (const rule of VIBE_GUARD_RULES) {
                if (rule.regex.test(line)) {
                  issues.push({
                    rule,
                    file: path.relative(targetDir, fullPath).replace(/\\/g, '/'),
                    line: index + 1,
                    snippet: line.trim(),
                  });
                }
              }
            });
          } catch {}
        }
      }
    }
  }

  scan(targetDir);

  const criticals = issues.filter(i => i.rule.severity === 'CRITICAL').length;
  const warnings = issues.filter(i => i.rule.severity === 'WARNING').length;

  let score = 100 - (criticals * 20) - (warnings * 5);
  if (score < 0) score = 0;

  console.log(colorize(`📊 DIAGNÓSTICO DE SEGURANÇA PARA MAKERS:`, 'bright'));
  console.log(ui.progressBar('Score', score, 30));

  if (score >= 90 && criticals === 0) {
    console.log(colorize('\n✅ SEU APLICATIVO ESTÁ SEGURO E PRONTO PARA O AR!', 'green'));
    console.log(colorize('🏆 Elegível ao Selo Público: [Urion Verified Security Grade A]\n', 'cyan'));
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
      if (item.rule.autoFixable) {
        console.log(`   ✨ Correção Automática Disponível: ${colorize(`npx urion-safeguard fix --rule=${item.rule.id.toLowerCase()}`, 'green')}`);
      }
    });
    console.log(colorize('\n============================================================', 'cyan'));
  }

  return { score, criticals, warnings, issuesCount: issues.length };
}

module.exports = { runModeMakerScanner, VIBE_GUARD_RULES };
