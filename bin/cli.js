#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2] || 'my-vibe-app';
const targetPath = path.join(process.cwd(), projectName);

console.log(`\n🛡️ Urion Safeguard CLI — Inicializando novo projeto: ${projectName}...\n`);

if (fs.existsSync(targetPath)) {
  console.error(`❌ Erro: O diretório "${projectName}" já existe.`);
  process.exit(1);
}

try {
  console.log(`📦 Clonando template oficial joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard...`);
  execSync(`git clone https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard.git "${targetPath}"`, {
    stdio: 'inherit',
  });

  console.log(`\n⚙️ Instalando dependências e inicializando ambiente...`);
  execSync(`cd "${targetPath}" && npm install --legacy-peer-deps`, { stdio: 'inherit' });

  console.log(`\n🎉 Projeto "${projectName}" criado com sucesso sob as regras de proteção Urion Safeguard 10/10!`);
  console.log(`\nPara começar:`);
  console.log(`  cd ${projectName}`);
  console.log(`  npm run dev\n`);
} catch (error) {
  console.error(`\n❌ Falha ao inicializar o projeto:`, error.message);
  process.exit(1);
}
