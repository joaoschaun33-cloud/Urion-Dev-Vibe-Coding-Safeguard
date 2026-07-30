#!/usr/bin/env node

/**
 * create-vibe-safeguard CLI Installer
 * Script para inicializar novos projetos Vibe Coding com governança e salvaguarda de IA.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const targetDir = args[0] || 'meu-vibe-app';
const targetPath = path.resolve(process.cwd(), targetDir);
const templatePath = path.resolve(import.meta.dirname, '..');

console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════════════');
console.log('\x1b[35m%s\x1b[0m', '   🚀 CREATE-VIBE-SAFEGUARD — INICIALIZADOR DE PROJETOS VIBE CODING');
console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════════════════\n');

if (fs.existsSync(targetPath)) {
  console.error(`\x1b[31m❌ A pasta target "${targetDir}" já existe! Escolha outro nome ou apague a pasta.\x1b[0m`);
  process.exit(1);
}

console.log(`📦 Criando novo projeto em: \x1b[33m${targetPath}\x1b[0m...`);

// Ignorar pastas pesadas e a propria pasta de destino se for criada dentro da raiz
const IGNORE_DIRS = ['node_modules', '.git', 'dist', '.nx', '.turbo', 'scratch', path.basename(targetDir)];

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  copyRecursive(templatePath, targetPath);

  // Atualizar package.json do novo projeto
  const pkgPath = path.join(targetPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.name = path.basename(targetDir);
    pkg.version = '0.1.0';
    delete pkg.bin;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }

  // Executar sincronização de regras no projeto criado
  console.log('🔄 Configurando regras Multi-IDE (Cursor, Claude Code, Windsurf, Copilot)...');
  execSync('node scripts/sync-ide-rules.mjs', { cwd: targetPath, stdio: 'ignore' });

  console.log('\x1b[32m%s\x1b[0m', '\n🎉 Projeto criado e configurado com sucesso!');
  console.log('\x1b[36m%s\x1b[0m', '────────────────────────────────────────────────────────────────────────');
  console.log(' 👉 Próximos passos para começar:');
  console.log(`    cd ${targetDir}`);
  console.log('    npm install');
  console.log('    npm run dev        (Backend API na porta 3000)');
  console.log('    npm run dev:web    (Frontend Dashboard React na porta 5173)');
  console.log('    npm run doctor:cli (Auditoria de saúde no terminal)');
  console.log('\x1b[36m%s\x1b[0m', '────────────────────────────────────────────────────────────────────────\n');
} catch (err) {
  console.error('\x1b[31m❌ Erro ao inicializar o projeto:\x1b[0m', err.message);
  process.exit(1);
}
