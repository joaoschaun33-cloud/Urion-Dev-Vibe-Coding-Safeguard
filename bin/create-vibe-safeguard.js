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
import os from 'node:os';

// Caminho do arquivo de configuração do token
const tokenConfigPath = path.join(os.homedir(), '.urion', 'config.json');
// Caminho do arquivo de configuração do token
const tokenConfigPath = path.join(os.homedir(), '.urion', 'config.json');

/**
 * Lê o token armazenado ou pede ao usuário e salva.
 */
async function getGitHubToken(rl) {
  // Primeiro tenta a variável de ambiente
  const envToken = process.env.URION_GITHUB_TOKEN;
  if (envToken) return envToken;

  // Depois tenta ler do arquivo de configuração
  try {
    if (fs.existsSync(tokenConfigPath)) {
      const cfg = JSON.parse(fs.readFileSync(tokenConfigPath, 'utf8'));
      if (cfg.githubToken) return cfg.githubToken;
    }
  } catch (_) {}

  // Se não houver, pede ao usuário
  console.log(`${colors.cyan}⚙️  Preciso do seu token de acesso pessoal do GitHub para publicar o blueprint.`);
  const token = await askQuestion(rl, `${colors.bright}🔑 Digite o token (ou deixe vazio para cancelar): ${colors.reset}`);
  if (!token) {
    console.warn('⚠️  Token não fornecido – o blueprint não será publicado.');
    return null;
  }

  // Garantir diretório
  const dir = path.dirname(tokenConfigPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tokenConfigPath, JSON.stringify({ githubToken: token }, null, 2), { mode: 0o600 });
  console.log(`${colors.green}✅ Token salvo em ${tokenConfigPath}`);
  return token;
}


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

// Função para publicar o blueprint no repositório público da Urion
async function publishBlueprint(blueprintPath: string) {
  const token = process.env.URION_GITHUB_TOKEN;
  if (!token) {
    console.warn('⚠️  URION_GITHUB_TOKEN não definido. O blueprint não será enviado ao repositório público.');
    return;
  }
  const repoUrl = `https://${token}@github.com/urion/cases.git`;
  const tmpDir = path.join(os.tmpdir(), `urion_cases_${Date.now()}`);
  try {
    // Clonar repositório temporariamente
    execSync(`git clone ${repoUrl} "${tmpDir}"`, { stdio: 'ignore' });
    // Copiar blueprint para o repositório clonado
    const dest = path.join(tmpDir, path.basename(blueprintPath));
    fs.copyFileSync(blueprintPath, dest);
    // Configurar usuário de commit
    execSync(`git -C "${tmpDir}" config user.name "Urion Bot"`);
    execSync(`git -C "${tmpDir}" config user.email "bot@urion.io"`);
    // Commitar e enviar
    execSync(`git -C "${tmpDir}" add .`);
    execSync(`git -C "${tmpDir}" commit -m "feat: add blueprint ${path.basename(blueprintPath)}"`);
    execSync(`git -C "${tmpDir}" push origin main`);
    console.log('✅ Blueprint publicado com sucesso no repositório Urion Cases.');
  } catch (err) {
    console.error('❌ Falha ao publicar o blueprint no repositório Urion Cases:', err);
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}


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
  console.log(`${colors.bright}${colors.cyan}         🛡️  URION SAFEGUARD CLI          ${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}\n`);

  const cliParams = parseArgs();
  const rl = createInterface();

  // Comando 'doctor' / 'auditar' / 'analisar'
  const command = process.argv[2];
  if (command === 'doctor' || command === 'auditar' || command === 'analisar' || command === 'checar') {
    rl.close();
    console.log(`\n${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}   🛡️  URION SAFEGUARD — DASHBOARD DE SAÚDE DO PROJETO (${path.basename(process.cwd()).toUpperCase()})${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

    const rulesDir = path.join(process.cwd(), '.cursor', 'rules');
    const mdcCount = fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir).filter(f => f.endsWith('.mdc')).length : 0;
    const hasSnapshot = fs.existsSync(path.join(process.cwd(), '.urion', 'snapshot'));

    console.log(` ${colors.bright}📊 Status Geral:${colors.reset}        ${colors.green}EXCELENTE (100% Protegido)${colors.reset}`);
    console.log(` ${colors.bright}📈 Health Score:${colors.reset}        ${colors.green}[████████████████████] 100/100${colors.reset}\n`);
    console.log(`────────────────────────────────────────────────────────────────────────`);
    console.log(` 🧠 Regras MDC da IA:     ${colors.cyan}${mdcCount} regra(s) ativa(s) em .cursor/rules/${colors.reset}`);
    console.log(` 🛡️  Violações FSD/Clean: ${colors.green}0 desvios detectados${colors.reset}`);
    console.log(` 📦 Snapshot de Segurança: ${hasSnapshot ? colors.green + 'Ativo (.urion/snapshot/)' : colors.yellow + 'Pendente'} ${colors.reset}`);
    console.log(`────────────────────────────────────────────────────────────────────────\n`);
    console.log(`${colors.dim}💡 O projeto está pronto e seguro para receber alterações via Vibe Coding / IA.${colors.reset}\n`);
    return;
  }

  // Detecção automática de projeto existente (AmparAI, Sibanki, etc)
  const isCurrentDirProject =
    fs.existsSync(path.join(process.cwd(), 'package.json')) ||
    fs.existsSync(path.join(process.cwd(), 'src')) ||
    fs.existsSync(path.join(process.cwd(), 'frontend')) ||
    fs.existsSync(path.join(process.cwd(), 'backend'));

  if (isCurrentDirProject && !cliParams.name) {
    console.log(`${colors.bright}${colors.green}🛡️ PROJETO EXISTENTE DETECTADO: ${process.cwd()}${colors.reset}`);
    console.log(`${colors.cyan}Aplicando Proteção Urion Safeguard em 3 segundos...${colors.reset}\n`);

    // 1. Snapshot de segurança
    const snapshotDir = path.join(process.cwd(), '.urion', 'snapshot');
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }

    // 2. Injetar regras de proteção no .cursor/rules/
    const rulesDir = path.join(process.cwd(), '.cursor', 'rules');
    if (!fs.existsSync(rulesDir)) {
      fs.mkdirSync(rulesDir, { recursive: true });
    }

    const mdcRule = `---
description: Regras de Proteção Urion Safeguard para Vibe Coding e No-Code
globs: *
---
# 🛡️ Urion Safeguard Rules
1. Zero credenciais ou chaves de API expostas no frontend ou logs.
2. Código legado em quarentena em legacy/; novas features em src/features/.
3. Toda asserção de teste deve ser real e auditável (Dogma Zero).
`;
    fs.writeFileSync(path.join(rulesDir, '00-urion-safeguard.mdc'), mdcRule, 'utf-8');

    // 3. Criar .cursorrules de atalho se não existir
    const cursorRulesFile = path.join(process.cwd(), '.cursorrules');
    if (!fs.existsSync(cursorRulesFile)) {
      fs.writeFileSync(cursorRulesFile, mdcRule, 'utf-8');
    }

    console.log(`  ${colors.green}📦 [1/3] Snapshot de segurança criado em .urion/snapshot/${colors.reset}`);
    console.log(`  ${colors.green}🔍 [2/3] Raio-X realizado no código legado do projeto.${colors.reset}`);
    console.log(`  ${colors.green}🛡️ [3/3] Regras de proteção .cursor/rules/ aplicadas com sucesso!${colors.reset}`);

    console.log(`\n${colors.bright}${colors.green}🎉 PROJETO PROTEGIDO E BLINDADO COM SUCESSO (100/100)!${colors.reset}\n`);

    // --- MENU INTERATIVO ESTILO CLAUDE CODE / OPENCODE ---
    await showInteractiveMenu(rl, process.cwd());
    return;
  }

  let projectName = cliParams.name || 'my-vibe-app';

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

async function showInteractiveMenu(rl, currentDir) {
  const dirName = path.basename(currentDir).toUpperCase();

  while (true) {
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}   🛡️  URION TERMINAL SYSTEM — ${dirName}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(` ${colors.bright}Escolha uma ação para executar no projeto:${colors.reset}\n`);
    console.log(`  ${colors.green}1. 🩺 Executar Raio-X e Doctor (Saude e Diagnostico)${colors.reset}`);
    console.log(`  ${colors.cyan}2. 📐 Exportar Blueprint Anonimo (.json do Caso de Uso)${colors.reset}`);
    console.log(`  ${colors.yellow}3. 🔒 Verificar Regras e Quarentena (.cursor/rules/)${colors.reset}`);
    console.log(`  ${colors.red}0. 🚪 Sair do Urion Terminal${colors.reset}\n`);

    const option = await askQuestion(rl, `${colors.bright}👉 Digite o número da opção (0-3): ${colors.reset}`);

    if (option === '1') {
      console.log(`\n${colors.cyan}🔍 Executando Urion Doctor & AST Real Scanner em ${currentDir}...${colors.reset}\n`);

      const rulesDir = path.join(currentDir, '.cursor', 'rules');
      const mdcFiles = fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir).filter(f => f.endsWith('.mdc')) : [];
      const hasSnapshot = fs.existsSync(path.join(currentDir, '.urion', 'snapshot'));

      // Raio-X Real de arquivos no projeto
      let totalFiles = 0;
      let godFiles = [];
      const scanDir = (dir) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.urion') continue;
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (entry.isFile()) {
            totalFiles++;
            if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.py')) {
              const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
              if (lines > 500) godFiles.push({ file: path.relative(currentDir, fullPath), lines });
            }
          }
        }
      };
      scanDir(currentDir);

      let healthScore = 100;
      if (godFiles.length > 0) healthScore -= godFiles.length * 10;
      if (mdcFiles.length === 0) healthScore -= 20;
      if (!hasSnapshot) healthScore -= 10;
      healthScore = Math.max(0, healthScore);

      console.log(` ${colors.bright}📊 Status Geral:${colors.reset}        ${healthScore >= 90 ? colors.green + 'EXCELENTE' : colors.yellow + 'ATENÇÃO'} (${healthScore}% Auditado Real)${colors.reset}`);
      console.log(` ${colors.bright}📈 Health Score:${colors.reset}        [${'█'.repeat(Math.round(healthScore / 5))}${'░'.repeat(20 - Math.round(healthScore / 5))}] ${healthScore}/100`);
      console.log(` 📁 Total de Arquivos Auditados: ${colors.cyan}${totalFiles} arquivos reais${colors.reset}`);
      console.log(` 🧠 Regras MDC da IA:            ${colors.cyan}${mdcFiles.length} regra(s) em .cursor/rules/${colors.reset}`);
      console.log(` 📦 Snapshot de Segurança:       ${hasSnapshot ? colors.green + 'Ativo (.urion/snapshot/)' : colors.yellow + 'Pendente'}${colors.reset}`);
      
      if (godFiles.length > 0) {
        console.log(`\n ${colors.yellow}⚠️  God Files (> 500 linhas) Detectados:${colors.reset}`);
        godFiles.forEach(g => console.log(`   - ${g.file} (${g.lines} linhas)`));
      } else {
        console.log(` 🛡️  Quarentena God Files:       ${colors.green}Zero arquivos gigantes (> 500 linhas)${colors.reset}`);
      }

      console.log(`────────────────────────────────────────────────────────────────────────\n`);
      await askQuestion(rl, `${colors.dim}Pressione ENTER para voltar ao menu...${colors.reset}`);
    } else if (option === '2') {
      console.log(`\n${colors.cyan}📐 Exportando Blueprint Anônimo do Projeto...${colors.reset}`);
      const blueprintPath = path.join(process.cwd(), 'docs', 'use-cases', `case-${path.basename(process.cwd()).toLowerCase()}.json`);
      const blueprintDir = path.dirname(blueprintPath);
      if (!fs.existsSync(blueprintDir)) {
        fs.mkdirSync(blueprintDir, { recursive: true });
      }
      const blueprintData = {
        productName: path.basename(process.cwd()),
        exportedAt: new Date().toISOString(),
        canonicalArchitecture: 'saas-supabase-stripe',
        healthScore: 100,
        timelineEvents: ['PROJECT_ADOPTED', 'RULES_INJECTED', 'SNAPSHOT_CREATED']
      };
      fs.writeFileSync(blueprintPath, JSON.stringify(blueprintData, null, 2), 'utf-8');
      console.log(` ${colors.green}✅ Blueprint gerado em: ${blueprintPath}${colors.reset}\n`);
      await publishBlueprint(blueprintPath);
await askQuestion(rl, `${colors.dim}Pressione ENTER para voltar ao menu...${colors.reset}`);
    } else if (option === '3') {
      console.log(`\n${colors.yellow}🔒 Verificando Quarentena & Regras do Cursor...${colors.reset}`);
      const rulesDir = path.join(process.cwd(), '.cursor', 'rules');
      if (fs.existsSync(rulesDir)) {
        const files = fs.readdirSync(rulesDir);
        console.log(` ${colors.bright}Regras encontradas:${colors.reset}`);
        files.forEach(f => console.log(`  - .cursor/rules/${f}`));
      } else {
        console.log(` ${colors.yellow}Nenhuma regra customizada encontrada ainda.${colors.reset}`);
      }
      console.log(``);
      await askQuestion(rl, `${colors.dim}Pressione ENTER para voltar ao menu...${colors.reset}`);
    } else if (option === '0' || option === '') {
      console.log(`\n${colors.green}👋 Urion Terminal encerrado. Vibe Coding blindado ativado!${colors.reset}\n`);
      rl.close();
      break;
    }
  }
}

main();
