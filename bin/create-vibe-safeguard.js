#!/usr/bin/env node

/**
 * 🛡️ Urion Safeguard CLI — Interactive Project Generator
 *
 * Transforma o repositório em uma experiência de Scaffolding Big Tech
 * para Vibe Coding, No-Code e Low-Code.
 *
 * Recursos:
 * - Interface limpa sem dependências pesadas
 * - Limpeza de histórico do git e personalização do package.json
 * - Suporte a prompts interativos via readline nativo
 * - Suporte a sinalizadores CLI (--name, --git, --install)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

// Configuração das cores ANSI para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    name: null,
    git: true,
    install: true,
    yes: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-y' || arg === '--yes') {
      params.yes = true;
    } else if (arg === '--no-git') {
      params.git = false;
    } else if (arg === '--no-install') {
      params.install = false;
    } else if (!arg.startsWith('-') && !params.name) {
      params.name = arg;
    }
  }

  return params;
}

async function main() {
  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  🛡️  URION SAFEGUARD — BIG TECH VIBE CODING CLI  ${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}\n`);

  const cliParams = parseArgs();
  const rl = createInterface();

  let projectName = cliParams.name;
  if (!projectName && !cliParams.yes) {
    projectName = await askQuestion(
      rl,
      `${colors.bright}👉 Nome do novo projeto (default: my-vibe-app): ${colors.reset}`
    );
  }
  if (!projectName) {
    projectName = 'my-vibe-app';
  }

  // Validação do nome do diretório
  const targetPath = path.join(process.cwd(), projectName);
  if (fs.existsSync(targetPath)) {
    console.error(`\n${colors.red}❌ Erro: O diretório "${projectName}" já existe!${colors.reset}\n`);
    rl.close();
    process.exit(1);
  }

  let initGit = cliParams.git;
  if (!cliParams.yes && cliParams.git !== false) {
    const answer = await askQuestion(
      rl,
      `${colors.bright}👉 Deseja inicializar um repositório Git limpo? (S/n): ${colors.reset}`
    );
    if (answer.toLowerCase() === 'n') {
      initGit = false;
    }
  }

  let runInstall = cliParams.install;
  if (!cliParams.yes && cliParams.install !== false) {
    const answer = await askQuestion(
      rl,
      `${colors.bright}👉 Deseja instalar as dependências automaticamente? (S/n): ${colors.reset}`
    );
    if (answer.toLowerCase() === 'n') {
      runInstall = false;
    }
  }

  rl.close();

  console.log(`\n${colors.yellow}🚀 Criando projeto blindado sob as regras Urion Safeguard em:${colors.reset} ${targetPath}\n`);

  try {
    // 1. Clonar repositório template
    console.log(`  ${colors.dim}[1/4] Clonando estrutura base do template...${colors.reset}`);
    execSync(`git clone --depth=1 https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard.git "${targetPath}"`, {
      stdio: 'ignore',
    });

    // 2. Remover histórico Git antigo
    console.log(`  ${colors.dim}[2/4] Sanitizando histórico do repositório...${colors.reset}`);
    const gitFolder = path.join(targetPath, '.git');
    if (fs.existsSync(gitFolder)) {
      fs.rmSync(gitFolder, { recursive: true, force: true });
    }

    // 3. Personalizar package.json do projeto
    console.log(`  ${colors.dim}[3/4] Personalizando metadados do projeto...${colors.reset}`);
    const pkgPath = path.join(targetPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkgData.name = projectName;
      pkgData.version = '0.1.0';
      delete pkgData.bin; // Remove o binário da CLI no novo projeto do usuário
      fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2), 'utf8');
    }

    // Inicializar novo repositório Git limpo se solicitado
    if (initGit) {
      execSync('git init', { cwd: targetPath, stdio: 'ignore' });
    }

    // 4. Instalar dependências se solicitado
    if (runInstall) {
      console.log(`  ${colors.dim}[4/4] Instalando dependências (npm install)...${colors.reset}`);
      execSync('npm install --legacy-peer-deps', { cwd: targetPath, stdio: 'inherit' });
      
      // Instalar também na pasta web se existir
      const webPath = path.join(targetPath, 'web');
      if (fs.existsSync(webPath)) {
        console.log(`  ${colors.dim}       Instalando dependências do frontend (web)...${colors.reset}`);
        execSync('npm install --legacy-peer-deps', { cwd: webPath, stdio: 'inherit' });
      }
    } else {
      console.log(`  ${colors.dim}[4/4] Instalação de dependências ignorada por opção.${colors.reset}`);
    }

    console.log(`\n${colors.bright}${colors.green}🎉 PROJETO VIBE CODING CRIADO COM SUCESSO! 10/10 ${colors.reset}\n`);
    console.log(`${colors.bright}Próximos passos:${colors.reset}`);
    console.log(`  ${colors.cyan}cd ${projectName}${colors.reset}`);
    if (!runInstall) {
      console.log(`  ${colors.cyan}npm install${colors.reset}`);
    }
    console.log(`  ${colors.cyan}npm run dev${colors.reset}   (Inicia backend e frontend em ambiente Vibe Coding)\n`);
    console.log(`${colors.dim}🛡️ Seu projeto está protegido com Dogma Zero, FSD, Prisma, Redis e regras .mdc automáticas.${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}❌ Falha ao criar o projeto:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main();
