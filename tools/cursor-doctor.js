#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
let errors = 0,
  warnings = 0;

function error(msg) {
  console.error(`❌ ERROR: ${msg}`);
  errors++;
}
function warn(msg) {
  console.warn(`⚠️  WARN: ${msg}`);
  warnings++;
}
function ok(msg) {
  console.log(`✅ ${msg}`);
}

function checkFileExists(filePath, required = true) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    if (required) error(`Arquivo obrigatorio nao encontrado: ${filePath}`);
    else warn(`Arquivo recomendado nao encontrado: ${filePath}`);
    return false;
  }
  ok(`${filePath} existe`);
  return true;
}

function checkMdcFile(filePath) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    error(`Arquivo .mdc nao encontrado: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  if (!content.startsWith('---')) {
    error(`${filePath}: frontmatter ausente`);
  } else {
    const endFrontmatter = content.indexOf('---', 3);
    if (endFrontmatter === -1) {
      error(`${filePath}: frontmatter malformado`);
    } else {
      const frontmatter = content.slice(3, endFrontmatter).trim();
      if (!frontmatter.includes('description:')) warn(`${filePath}: sem 'description'`);
      if (!frontmatter.includes('globs:')) warn(`${filePath}: sem 'globs'`);
      if (!frontmatter.includes('alwaysApply:')) warn(`${filePath}: sem 'alwaysApply'`);
    }
  }
  if (content.length < 200) warn(`${filePath}: conteudo muito curto`);
  ok(`${filePath} — valido`);
}

console.log('🩺 Cursor Doctor — Diagnostico do Repositorio\n');
console.log('='.repeat(60));

console.log('\n📁 Arquivos Essenciais:');
checkFileExists('.cursorrules');
checkFileExists('AGENTS.md');
checkFileExists('package.json');
checkFileExists('tsconfig.json');
checkFileExists('docker-compose.yml');
checkFileExists('.gitignore');
checkFileExists('LICENSE');
checkFileExists('Makefile');
checkFileExists('first-time.sh');
checkFileExists('QUICKSTART.md');

console.log('\n🧠 Regras da IA:');
checkMdcFile('.cursor/rules/honesty.mdc');
checkMdcFile('.cursor/rules/frontend.mdc');
checkMdcFile('.cursor/rules/backend.mdc');
checkMdcFile('.cursor/rules/testing.mdc');
checkMdcFile('.cursor/rules/security.mdc');
checkMdcFile('.cursor/rules/database-skill.mdc');
checkMdcFile('.cursor/rules/performance.mdc');
checkMdcFile('.cursor/rules/accessibility.mdc');
checkMdcFile('.cursor/rules/documentation.mdc');

console.log('\n🏗️  Codigo Funcional:');
checkFileExists('src/app/server.ts');
checkFileExists('src/app/routes.ts');
checkFileExists('src/app/middleware/error-handler.ts');
checkFileExists('src/shared/errors/domain-error.ts');
checkFileExists('src/shared/http/problem-details.ts');
checkFileExists('src/shared/infrastructure/logger.ts');
checkFileExists('src/shared/infrastructure/database.ts');
checkFileExists('src/features/todo/domain/todo.ts');
checkFileExists('src/features/todo/application/create-todo.ts');
checkFileExists('src/features/todo/infrastructure/todo-repository.prisma.ts');
checkFileExists('src/features/todo/presentation/todo-controller.ts');

console.log('\n📐 Configuracoes:');
checkFileExists('eslint.config.js');
checkFileExists('prettier.config.js');
checkFileExists('vitest.config.ts');
checkFileExists('prisma/schema.prisma');
checkFileExists('.vscode/settings.json');

console.log('\n📚 Documentacao:');
checkFileExists('docs/onboarding.md');
checkFileExists('docs/architecture.md');
checkFileExists('docs/tech-stack.md');
checkFileExists('docs/anti-patterns.md');
checkFileExists('docs/monitoring.md');
checkFileExists('docs/governance.md');
checkFileExists('docs/scaling.md');
checkFileExists('docs/ide-setup.md');
checkFileExists('docs/vibe-playbook.md');
checkFileExists('docs/multi-stack.md');
checkFileExists('docs/metrics.md');
checkFileExists('docs/ai-workflow.md');

console.log('\n💬 Prompts:');
checkFileExists('prompts/honesty-check.md');
checkFileExists('prompts/feature-implementation.md');
checkFileExists('prompts/code-review.md');
checkFileExists('prompts/refactor.md');
checkFileExists('prompts/bug-investigation.md');
checkFileExists('prompts/deployment.md');

console.log('\n📐 Templates:');
checkFileExists('templates/feature/README.md');
checkFileExists('templates/component/component.tsx');
checkFileExists('templates/api-endpoint/endpoint.ts');

console.log('\n🧪 Testes e Validacao:');
checkFileExists('checks/smoke.test.js');
checkFileExists('tests/setup.ts');
checkFileExists('src/features/todo/tests/unit/create-todo.test.ts');

console.log('\n🔧 Scripts:');
checkFileExists('scripts/generate-feature.mjs');
checkFileExists('scripts/bootstrap.js');

console.log('\n🐛 GitHub Templates:');
checkFileExists('.github/ISSUE_TEMPLATE/bug_report.md');
checkFileExists('.github/ISSUE_TEMPLATE/ai_hallucination.md');
checkFileExists('.github/ISSUE_TEMPLATE/feature_request.md');
checkFileExists('.github/PULL_REQUEST_TEMPLATE.md');

console.log('\n🛡️  Governanca:');
checkFileExists('CHANGELOG.md');
checkFileExists('CODE_OF_CONDUCT.md');
checkFileExists('SECURITY.md');
checkFileExists('CONTRIBUTING.md');

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Resumo: ${errors} erro(s), ${warnings} aviso(s)`);
if (errors > 0) {
  console.log('❌ Repositorio NAO esta saudavel.');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  Funcional com avisos.');
  process.exit(0);
} else {
  console.log('🎉 100% saudavel! Pronto para vibe coding.');
  process.exit(0);
}
