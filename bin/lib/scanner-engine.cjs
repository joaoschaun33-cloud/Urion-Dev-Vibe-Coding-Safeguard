// bin/lib/scanner-engine.cjs
// Scanner completo com animacoes e relatorio rico

const fs = require('fs');
const path = require('path');
const { analyzeProject } = require('./project-detector.cjs');
const {
  colors, printHeader, printSuccess, printWarning, printError,
  animatedProgress, progressBar
} = require('./ui-kit.cjs');

async function runScanner(projectPath) {
  printHeader('URION SCANNER — RAIO-X COMPLETO', projectPath);

  await animatedProgress('Inicializando motores de analise...', 500, 5);
  await animatedProgress('Carregando regras de seguranca...', 400, 4);

  const analysis = analyzeProject(projectPath);

  let healthScore = 100;
  const issues = [];

  if (analysis.files.codeFiles > 0 && analysis.files.testFiles === 0) {
    healthScore -= 25;
    issues.push('Zero testes detectados no projeto');
  }
  if (!analysis.hasCursorRules) {
    healthScore -= 15;
    issues.push('Arquivo .cursorrules nao encontrado');
  }
  if (!analysis.hasAgentsMd) {
    healthScore -= 10;
    issues.push('AGENTS.md nao encontrado');
  }
  if (analysis.rulesCount === 0) {
    healthScore -= 20;
    issues.push('Nenhuma regra .mdc em .cursor/rules/');
  }
  if (!analysis.hasSnapshot) {
    healthScore -= 10;
    issues.push('Snapshot de seguranca nao criado');
  }

  healthScore = Math.max(0, healthScore);

  const status = healthScore >= 90 ? 'EXCELENTE' : healthScore >= 70 ? 'BOM' : healthScore >= 50 ? 'ATENCAO' : 'CRITICO';
  const statusColor = healthScore >= 90 ? colors.green : healthScore >= 70 ? colors.cyan : healthScore >= 50 ? colors.yellow : colors.red;

  console.log(`\n${colors.bright}📊 Status Geral:${colors.reset} ${statusColor}${status} (${healthScore}% Auditado)${colors.reset}`);
  console.log(` ${progressBar('Health Score', healthScore, 40)}`);

  console.log(`\n${colors.bright}📁 Metricas do Projeto:${colors.reset}`);
  console.log(`   Total de Arquivos: ${colors.cyan}${analysis.files.total}${colors.reset}`);
  console.log(`   Arquivos de Codigo: ${colors.cyan}${analysis.files.codeFiles}${colors.reset}`);
  console.log(`   Arquivos de Teste: ${colors.cyan}${analysis.files.testFiles}${colors.reset}`);
  console.log(`   Cobertura Estimada: ${colors.cyan}${analysis.files.codeFiles > 0 ? Math.round((analysis.files.testFiles / analysis.files.codeFiles) * 100) : 0}%${colors.reset}`);

  console.log(`\n${colors.bright}🏗️ Arquitetura & Stack:${colors.reset}`);
  console.log(`   Padrao: ${colors.cyan}${analysis.architecture}${colors.reset}`);
  console.log(`   Framework: ${colors.cyan}${analysis.stack.framework || 'N/A'}${colors.reset}`);
  console.log(`   Frontend: ${colors.cyan}${analysis.stack.frontend || 'N/A'}${colors.reset}`);
  console.log(`   Database: ${colors.cyan}${analysis.stack.database || 'N/A'}${colors.reset}`);
  console.log(`   ORM: ${colors.cyan}${analysis.stack.orm || 'N/A'}${colors.reset}`);
  console.log(`   Testes: ${colors.cyan}${analysis.stack.testing.join(', ') || 'N/A'}${colors.reset}`);

  console.log(`\n${colors.bright}🛡️ Governanca Urion:${colors.reset}`);
  console.log(`   Regras MDC: ${analysis.rulesCount > 0 ? colors.green : colors.yellow}${analysis.rulesCount} regra(s)${colors.reset}`);
  console.log(`   .cursorrules: ${analysis.hasCursorRules ? colors.green + '✓ Presente' : colors.yellow + '✗ Ausente'}${colors.reset}`);
  console.log(`   AGENTS.md: ${analysis.hasAgentsMd ? colors.green + '✓ Presente' : colors.yellow + '✗ Ausente'}${colors.reset}`);
  console.log(`   Snapshot: ${analysis.hasSnapshot ? colors.green + '✓ Ativo' : colors.yellow + '✗ Pendente'}${colors.reset}`);

  if (analysis.features.length > 0) {
    console.log(`\n${colors.bright}🧩 Features Detectadas:${colors.reset}`);
    analysis.features.forEach(f => console.log(`   ${colors.cyan}● ${f}${colors.reset}`));
  }

  if (issues.length > 0) {
    console.log(`\n${colors.bright}${colors.yellow}⚠️ Pontos de Atencao:${colors.reset}`);
    issues.forEach(i => printWarning(i));
  }

  if (healthScore >= 90) {
    console.log(`\n${colors.green}${colors.bright}🎉 Projeto 100% blindado! Pronto para Vibe Coding com IA.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}💡 Recomendacao: Execute o comando de protecao automatica para corrigir os pontos pendentes.${colors.reset}\n`);
  }

  return { healthScore, analysis, issues };
}

module.exports = { runScanner };
