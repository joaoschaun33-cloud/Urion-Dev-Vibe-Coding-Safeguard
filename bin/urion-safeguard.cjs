#!/usr/bin/env node

/**
 * 🛡️ URION SAFEGUARD CLI v2.0
 * Experiencia de Primeiro Contato — Totalmente Autonoma
 * 
 * Comandos:
 *   npx urion-safeguard          → Menu interativo (primeiro contato)
 *   npx urion-safeguard scanner  → Executar scanner direto
 *   npx urion-safeguard blueprint → Executar blueprint automatico
 *   npx urion-safeguard rules    → Verificar regras
 * 
 * @author Joao Schaun
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { colors, symbols, box, printHeader, printSuccess, printError } = require('./lib/ui-kit.cjs');
const { runScanner } = require('./lib/scanner-engine.cjs');
const { runBlueprintAuto } = require('./lib/blueprint-auto.cjs');
const { runRulesChecker } = require('./lib/rules-checker.cjs');

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => resolve(answer.trim()));
  });
}

function detectProject() {
  const cwd = process.cwd();
  const indicators = [
    'package.json', 'src', 'frontend', 'backend',
    'tsconfig.json', '.cursorrules', 'AGENTS.md'
  ];
  return indicators.some(f => fs.existsSync(path.join(cwd, f))) ? cwd : null;
}

async function showBootSequence() {
  const steps = [
    { label: 'Inicializando blindagem neural...', duration: 300 },
    { label: 'Detectando ambiente de desenvolvimento...', duration: 400 },
    { label: 'Carregando regras de seguranca...', duration: 300 },
    { label: 'Verificando integridade do sistema...', duration: 200 },
  ];

  for (const step of steps) {
    process.stdout.write(`${colors.dim}  ${step.label}${colors.reset}`);
    await new Promise(r => setTimeout(r, step.duration));
    process.stdout.write(` ${colors.green}✓${colors.reset}\n`);
  }
}

async function showMainMenu(rl, projectPath) {
  const projectName = path.basename(projectPath).toUpperCase();

  while (true) {
    console.log(box(
      `🛡️  URION TERMINAL — ${projectName}`,
      [
        '',
        `   ${colors.bright}Escolha uma acao para executar:${colors.reset}`,
        '',
        `   ${colors.green}[1] 🔍  SCANNER${colors.reset}      → Raio-X completo do projeto`,
        `   ${colors.cyan}[2] 📐 BLUEPRINT${colors.reset}     → Enviar caso de uso (automatico)`,
        `   ${colors.yellow}[3] 🔒 REGRAS${colors.reset}       → Verificar .cursor/rules/`,
        '',
        `   ${colors.red}[0] 🚪 SAIR${colors.reset}         → Encerrar sessao blindada`,
        '',
      ]
    ));

    const option = await askQuestion(rl, `${colors.bright}👉 Digite o numero da opcao (0-3): ${colors.reset}`);

    switch (option) {
      case '1':
        await runScanner(projectPath);
        await askQuestion(rl, `${colors.dim}Pressione ENTER para voltar ao menu...${colors.reset}`);
        break;

      case '2':
        await runBlueprintAuto(projectPath);
        await askQuestion(rl, `${colors.dim}Pressione ENTER para voltar ao menu...${colors.reset}`);
        break;

      case '3':
        await runRulesChecker(projectPath);
        await askQuestion(rl, `${colors.dim}Pressione ENTER para voltar ao menu...${colors.reset}`);
        break;

      case '0':
      case '':
        console.log(`\n${colors.green}${colors.bright}👋 Urion Terminal encerrado. Vibe Coding blindado ativado!${colors.reset}\n`);
        rl.close();
        return;

      default:
        console.log(`\n${colors.red}❌ Opcao invalida. Tente novamente.${colors.reset}\n`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const projectPath = detectProject();

  if (command === 'scanner' || command === 'scan' || command === 'doctor') {
    if (!projectPath) {
      printError('Nenhum projeto detectado no diretorio atual.');
      process.exit(1);
    }
    await runScanner(projectPath);
    return;
  }

  if (command === 'blueprint' || command === 'bp') {
    if (!projectPath) {
      printError('Nenhum projeto detectado no diretorio atual.');
      process.exit(1);
    }
    await runBlueprintAuto(projectPath);
    return;
  }

  if (command === 'rules' || command === 'regras') {
    if (!projectPath) {
      printError('Nenhum projeto detectado no diretorio atual.');
      process.exit(1);
    }
    await runRulesChecker(projectPath);
    return;
  }

  // Modo interativo (primeiro contato)
  printHeader('URION SAFEGUARD v2.0', 'Protecao Neural para Vibe Coding');

  if (!projectPath) {
    console.log(`${colors.yellow}⚠️  Nenhum projeto detectado no diretorio atual.${colors.reset}`);
    console.log(`${colors.dim}   Rode este comando dentro de um projeto ou use: npx urion-safeguard create <nome>${colors.reset}\n`);
    process.exit(0);
  }

  await showBootSequence();

  console.log(`\n${colors.green}${symbols.check} Projeto detectado: ${colors.bright}${path.basename(projectPath)}${colors.reset}`);
  console.log(`${colors.green}${symbols.check} ${colors.dim}Ambiente pronto para blindagem${colors.reset}\n`);

  const rl = createInterface();
  await showMainMenu(rl, projectPath);
}

main().catch(err => {
  console.error(`${colors.red}❌ Erro fatal: ${err.message}${colors.reset}`);
  process.exit(1);
});
