import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function assertFileExists(filePath, description) {
  if (!fs.existsSync(path.join(ROOT, filePath))) {
    console.error(`❌ SMOKE FAIL: ${description}: ${filePath}`);
    process.exit(1);
  }
  console.log(`✅ ${description}`);
}

function assertValidJson(filePath, description) {
  try {
    JSON.parse(fs.readFileSync(path.join(ROOT, filePath), 'utf8'));
    console.log(`✅ ${description}`);
  } catch (e) {
    console.error(`❌ SMOKE FAIL: ${description}: ${e.message}`);
    process.exit(1);
  }
}

console.log('🧪 Smoke Tests...\n');

assertFileExists('.cursorrules', 'Regras globais do Cursor');
assertFileExists('AGENTS.md', 'Dogmas arquiteturais');
assertFileExists('package.json', 'Package.json');
assertFileExists('tsconfig.json', 'TypeScript config');
assertFileExists('docker-compose.yml', 'Docker Compose');
assertFileExists('src/app/server.ts', 'Servidor Express');
assertFileExists('src/app/routes.ts', 'Rotas');
assertFileExists('src/shared/errors/domain-error.ts', 'Erros de dominio');
assertFileExists('src/shared/http/problem-details.ts', 'RFC 7807');
assertFileExists('src/shared/infrastructure/logger.ts', 'Logger Pino');
assertFileExists('src/shared/infrastructure/database.ts', 'Database Prisma');
assertFileExists('src/features/todo/domain/todo.ts', 'Entidade Todo');
assertFileExists('src/features/todo/application/create-todo.ts', 'Use Case CreateTodo');
assertFileExists('src/features/todo/infrastructure/todo-repository.prisma.ts', 'Repo Prisma');
assertFileExists('src/features/todo/presentation/todo-controller.ts', 'Controller Todo');
assertFileExists('prisma/schema.prisma', 'Schema Prisma');
assertFileExists('vitest.config.ts', 'Config Vitest');
assertFileExists('eslint.config.js', 'ESLint config');
assertFileExists('prettier.config.js', 'Prettier config');
assertFileExists('QUICKSTART.md', 'Quick Start');
assertFileExists('docs/ide-setup.md', 'IDE Setup');
assertFileExists('docs/vibe-playbook.md', 'Vibe Playbook');
assertFileExists('docs/multi-stack.md', 'Multi Stack');
assertFileExists('docs/metrics.md', 'Metrics');
assertValidJson('package.json', 'package.json valido');

console.log('\n🎉 Smoke tests passaram! Tudo funcionando.');
