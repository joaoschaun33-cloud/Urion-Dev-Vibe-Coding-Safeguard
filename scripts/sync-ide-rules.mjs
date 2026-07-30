#!/usr/bin/env node

/**
 * Script de Sincronizacao Multi-IDE — Vibe Safeguard
 * Gera e atualiza automaticamente instrucoes nativas para Claude Code, Windsurf e Copilot
 * a partir de AGENTS.md e .cursor/rules/
 */

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const agentsPath = path.join(rootDir, 'AGENTS.md');

if (!fs.existsSync(agentsPath)) {
  console.error('❌ Arquivo AGENTS.md nao encontrado na raiz!');
  process.exit(1);
}

const agentsContent = fs.readFileSync(agentsPath, 'utf-8');

console.log('🔄 Sincronizando regras de IA para múltiplas IDEs...\n');

// 1. Gerar CLAUDE.md (Claude Code)
const claudeHeader = `# CLAUDE.md — Diretrizes de Desenvolvimento para Claude Code\n\n> Gerado automaticamente via \`npm run sync:rules\`. A fonte unica de verdade e o \`AGENTS.md\`.\n\n`;
fs.writeFileSync(path.join(rootDir, 'CLAUDE.md'), claudeHeader + agentsContent);
console.log('  ✅ CLAUDE.md gerado com sucesso (Claude Code).');

// 2. Gerar .windsurfrules (Windsurf)
const windsurfHeader = `# .windsurfrules — Regras Nativas para Windsurf Cascade\n\n> Gerado automaticamente via \`npm run sync:rules\`.\n\n`;
fs.writeFileSync(path.join(rootDir, '.windsurfrules'), windsurfHeader + agentsContent);
console.log('  ✅ .windsurfrules gerado com sucesso (Windsurf).');

// 3. Gerar .github/copilot-instructions.md (GitHub Copilot)
const githubDir = path.join(rootDir, '.github');
if (!fs.existsSync(githubDir)) {
  fs.mkdirSync(githubDir, { recursive: true });
}
const copilotHeader = `# GitHub Copilot Custom Instructions\n\n> Gerado automaticamente via \`npm run sync:rules\`.\n\n`;
fs.writeFileSync(path.join(githubDir, 'copilot-instructions.md'), copilotHeader + agentsContent);
console.log('  ✅ .github/copilot-instructions.md gerado com sucesso (GitHub Copilot).\n');

console.log('🎉 Sincronização Multi-IDE concluída! O projeto agora é nativamente compatível com Cursor, Claude Code, Windsurf e Copilot.');
