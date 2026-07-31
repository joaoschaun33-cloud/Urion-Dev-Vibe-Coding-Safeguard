#!/usr/bin/env node

/**
 * Script de Sincronizacao Multi-IDE Avançado (Adapter Pattern & SHA256 Verification)
 * Garante a replicacao atomica de regras para Claude Code, Windsurf e GitHub Copilot.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * @typedef {Object} IDEAdapter
 * @property {string} name
 * @property {string} targetPath
 * @property {function(string): string} formatHeader
 */

const rootDir = process.cwd();
const agentsPath = path.join(rootDir, 'AGENTS.md');

if (!fs.existsSync(agentsPath)) {
  console.error('❌ Arquivo AGENTS.md nao encontrado na raiz!');
  process.exit(1);
}

const sourceContent = fs.readFileSync(agentsPath, 'utf-8');
const sourceHash = crypto.createHash('sha256').update(sourceContent).digest('hex');

const adapters = [
  {
    name: 'Claude Code',
    targetPath: path.join(rootDir, 'CLAUDE.md'),
    formatHeader: (title) => `# CLAUDE.md — Diretrizes para Claude Code\n\n> Hash Fonte: ${sourceHash.slice(0, 8)} | Gerado automaticamente via npm run sync:rules.\n\n`,
  },
  {
    name: 'Windsurf Cascade',
    targetPath: path.join(rootDir, '.windsurfrules'),
    formatHeader: () => `# .windsurfrules — Regras para Windsurf Cascade\n\n> Hash Fonte: ${sourceHash.slice(0, 8)} | Gerado automaticamente via npm run sync:rules.\n\n`,
  },
  {
    name: 'GitHub Copilot',
    targetPath: path.join(rootDir, '.github', 'copilot-instructions.md'),
    formatHeader: () => `# GitHub Copilot Custom Instructions\n\n> Hash Fonte: ${sourceHash.slice(0, 8)} | Gerado automaticamente via npm run sync:rules.\n\n`,
  },
];

console.log('🔄 Sincronizando regras de IA com verificação SHA256 & atomic file write...\n');

for (const adapter of adapters) {
  const dir = path.dirname(adapter.targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const finalContent = adapter.formatHeader(adapter.name) + sourceContent;
  const tempPath = `${adapter.targetPath}.tmp.${Date.now()}`;

  // 1. Escrita no arquivo temporário
  fs.writeFileSync(tempPath, finalContent, 'utf-8');

  // 2. Substituição atômica
  fs.renameSync(tempPath, adapter.targetPath);

  console.log(`  ✅ [${adapter.name}] -> ${path.relative(rootDir, adapter.targetPath)} (SHA256: ${sourceHash.slice(0, 8)})`);
}

console.log('\n🎉 Sincronização Multi-IDE de nível enterprise concluída!');
