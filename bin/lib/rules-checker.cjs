// bin/lib/rules-checker.cjs
// Verifica .cursor/rules/ com relatorio visual rico

const fs = require('fs');
const path = require('path');
const {
  colors, printHeader, printSuccess, printWarning, printError
} = require('./ui-kit.cjs');

function validateMdcFile(filePath) {
  const issues = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);

  if (!content.startsWith('---')) {
    issues.push('Frontmatter ausente');
  } else {
    const endFrontmatter = content.indexOf('---', 3);
    if (endFrontmatter === -1) {
      issues.push('Frontmatter malformado');
    } else {
      const frontmatter = content.slice(3, endFrontmatter).trim();
      if (!frontmatter.includes('description:')) issues.push('Sem "description" no frontmatter');
      if (!frontmatter.includes('globs:')) issues.push('Sem "globs" no frontmatter');
      if (!frontmatter.includes('alwaysApply:')) issues.push('Sem "alwaysApply" no frontmatter');
    }
  }

  if (content.length < 200) issues.push('Conteudo muito curto (< 200 chars)');
  if (!content.includes('#')) issues.push('Sem titulo markdown');

  return { filename, valid: issues.length === 0, issues };
}

async function runRulesChecker(projectPath) {
  printHeader('VERIFICADOR DE REGRAS URION', '.cursor/rules/');

  const rulesDir = path.join(projectPath, '.cursor', 'rules');
  const cursorRulesFile = path.join(projectPath, '.cursorrules');
  const agentsFile = path.join(projectPath, 'AGENTS.md');

  let totalRules = 0;
  let validRules = 0;
  let invalidRules = 0;

  console.log(`${colors.bright}📋 Arquivo .cursorrules:${colors.reset}`);
  if (fs.existsSync(cursorRulesFile)) {
    const stats = fs.statSync(cursorRulesFile);
    printSuccess(`Presente (${Math.round(stats.size / 1024)}KB)`);
  } else {
    printError('AUSENTE — Crie com: echo "# Regras Urion" > .cursorrules');
  }

  console.log(`\n${colors.bright}📋 Arquivo AGENTS.md:${colors.reset}`);
  if (fs.existsSync(agentsFile)) {
    const stats = fs.statSync(agentsFile);
    printSuccess(`Presente (${Math.round(stats.size / 1024)}KB)`);
  } else {
    printError('AUSENTE — Documento essencial para Dogma Zero');
  }

  console.log(`\n${colors.bright}📋 Regras MDC em .cursor/rules/:${colors.reset}`);

  if (!fs.existsSync(rulesDir)) {
    printError('Diretorio .cursor/rules/ nao existe!');
    console.log(`\n${colors.yellow}💡 Criando estrutura minima...${colors.reset}\n`);
    fs.mkdirSync(rulesDir, { recursive: true });

    const defaultRule = `---
description: Regras de Protecao Urion Safeguard para Vibe Coding
globs: *
alwaysApply: true
---
# 🛡️ Urion Safeguard Rules

## 1. Seguranca
- ZERO credenciais ou chaves de API expostas no frontend ou logs.
- Nunca commitar arquivos .env.

## 2. Arquitetura
- Codigo legado em quarentena em legacy/.
- Novas features em src/features/.
- Seguir Feature-Sliced Design (FSD).

## 3. Qualidade
- Toda assercao de teste deve ser real e auditavel (Dogma Zero).
- Proibir console.log em producao.
- Maximo 500 linhas por arquivo.
`;
    fs.writeFileSync(path.join(rulesDir, '00-urion-safeguard.mdc'), defaultRule, 'utf8');
    printSuccess('Regra padrao 00-urion-safeguard.mdc criada!');
  } else {
    const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.mdc'));
    totalRules = files.length;

    if (files.length === 0) {
      printWarning('Nenhum arquivo .mdc encontrado em .cursor/rules/');
    } else {
      files.forEach(file => {
        const result = validateMdcFile(path.join(rulesDir, file));
        if (result.valid) {
          validRules++;
          printSuccess(`${file} — valido`);
        } else {
          invalidRules++;
          printError(`${file} — ${result.issues.join(', ')}`);
        }
      });
    }
  }

  console.log(`\n${colors.bright}${'─'.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}📊 Resumo:${colors.reset}`);
  console.log(`   Total de regras: ${colors.cyan}${totalRules}${colors.reset}`);
  console.log(`   Validas: ${colors.green}${validRules}${colors.reset}`);
  console.log(`   Com problemas: ${invalidRules > 0 ? colors.red : colors.green}${invalidRules}${colors.reset}`);

  if (validRules === totalRules && totalRules > 0) {
    console.log(`\n${colors.green}${colors.bright}🛡️ Todas as regras estao validas! Sua IA esta protegida.${colors.reset}\n`);
  } else if (totalRules === 0) {
    console.log(`\n${colors.yellow}💡 Adicione regras .mdc para proteger seu projeto de alucinacoes da IA.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️ Corrija as regras com problemas para garantir protecao total.${colors.reset}\n`);
  }

  return { totalRules, validRules, invalidRules };
}

module.exports = { runRulesChecker, validateMdcFile };
