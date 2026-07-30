#!/usr/bin/env node
/**
 * bootstrap.js — CLI interativo para gerar projeto vibe coding
 *
 * Uso: node scripts/bootstrap.js
 */

import { createInterface } from 'readline';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🧠 Vibe Coding Bootstrap                                   ║');
  console.log('║  Configure seu projeto em 2 minutos                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const projectName = await question('Nome do projeto: ') || 'vibe-app';
  const backend = await question('Backend [express/fastapi/go/rust]: ') || 'express';
  const frontend = await question('Frontend [none/react/vue/svelte]: ') || 'none';
  const database = await question('Database [postgres/mysql/mongodb]: ') || 'postgres';

  console.log(`\n⚙️  Configurando ${projectName}...`);
  console.log(`   Backend: ${backend}`);
  console.log(`   Frontend: ${frontend}`);
  console.log(`   Database: ${database}\n`);

  // Aqui voce adicionaria a logica real de geracao
  // Por enquanto, e um scaffold que mostra o que seria gerado

  console.log('📦 Estrutura que seria gerada:');
  console.log(`   src/features/          ← FSD features`);
  console.log(`   src/app/server.${backend === 'express' ? 'ts' : 'py'}  ← Entry point`);
  console.log(`   prisma/schema.prisma   ← ${database} schema`);
  console.log(`   docker-compose.yml     ← ${database} + redis`);
  console.log(`   .cursor/rules/         ← Regras para ${backend}`);
  console.log(`   docs/                  ← Documentacao completa\n`);

  console.log('✅ Bootstrap concluido!');
  console.log('   Proximo passo: bash first-time.sh\n');

  rl.close();
}

main().catch(console.error);
