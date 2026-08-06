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
const { VIBE_GUARD_RULES } = require('./vibe-guard-rules.generated.cjs');

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
    });
    console.log(colorize('\n============================================================', 'cyan'));
  }

  return { score, criticals, warnings, issuesCount: issues.length };
}

module.exports = { runModeMakerScanner, VIBE_GUARD_RULES };
