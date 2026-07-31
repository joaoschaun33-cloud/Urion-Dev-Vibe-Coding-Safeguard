#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

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

// Subrotina de Auditoria Estática Real via TypeScript Compiler API (AST Real)
function auditCodeQualityAST(dir) {
  console.log('\n🔬 Auditoria Estatica de Codigo (AST Real com TypeScript Compiler API):');
  const files = getAllFiles(path.join(ROOT, dir));

  let consoleLogCount = 0;
  let hardcodedSecretsCount = 0;
  const secretRegex = /(api[_-]?key|secret[_-]?key|bearer\s+[a-zA-Z0-9_\-\.]{20,}|password\s*=\s*['"][^'"]+['"])/i;

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const relative = path.relative(ROOT, file);
      const content = fs.readFileSync(file, 'utf8');

      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      // AST Walk para identificar chamadas a console.log() e acessos dinâmicos a console
      function visit(node) {
        if (ts.isCallExpression(node)) {
          const expr = node.expression;
          // console.log(...)
          if (
            ts.isPropertyAccessExpression(expr) &&
            ts.isIdentifier(expr.expression) &&
            expr.expression.text === 'console' &&
            expr.name.text === 'log'
          ) {
            if (!relative.includes('test') && !relative.includes('scripts') && !relative.includes('tools')) {
              consoleLogCount++;
              warn(`${relative}: console.log() AST detectado em codigo de producao`);
            }
          }
          // console['log'](...)
          if (
            ts.isElementAccessExpression(expr) &&
            ts.isIdentifier(expr.expression) &&
            expr.expression.text === 'console' &&
            ts.isStringLiteral(expr.argumentExpression) &&
            expr.argumentExpression.text === 'log'
          ) {
            if (!relative.includes('test') && !relative.includes('scripts') && !relative.includes('tools')) {
              consoleLogCount++;
              warn(`${relative}: console['log']() acessado dinamicamente em producao`);
            }
          }
        }
        ts.forEachChild(node, visit);
      }

      visit(sourceFile);

      // 2. Proibir hardcoded secrets
      if (secretRegex.test(content) && !relative.includes('example') && !relative.includes('test')) {
        hardcodedSecretsCount++;
        error(`${relative}: Possivel credencial/secret hardcoded detectado!`);
      }
    }
  }

  if (consoleLogCount === 0) ok('Zero console.log() residuais detectados por AST Parser');
  if (hardcodedSecretsCount === 0) ok('Zero credenciais ou secrets hardcoded detectados em src/');
}

// Subrotina da Automação 3: Avaliador da Honestidade (Dogma Zero)
function auditDogmaZeroHonesty() {
  console.log('\n⚖️  Auditoria de Honestidade de Codigo (Dogma Zero Evaluator):');
  const files = getAllFiles(path.join(ROOT, 'src'));

  let emptyStubsCount = 0;
  let trivialAssertionsCount = 0;

  for (const file of files) {
    if (file.endsWith('.test.ts') || file.endsWith('.spec.ts')) {
      const relative = path.relative(ROOT, file);
      const content = fs.readFileSync(file, 'utf8');

      // Detecta stubs vazios de IA / throw Error('Not implemented')
      if (content.includes("throw new Error('Not implemented')") || content.includes('// TODO: implement test')) {
        emptyStubsCount++;
        warn(`${relative}: Teste contem stub nao implementado / placeholder de IA`);
      }

      // Detecta asserções fáceis / enganosas (ex: expect(true).toBe(true))
      if (/expect\((true|false|1|0)\)\.to(Be|Equal)\((true|false|1|0)\)/.test(content)) {
        trivialAssertionsCount++;
        error(`${relative}: Teste contem assercao enganosa / trivial (expect(true).toBe(true))!`);
      }
    }
  }

  if (emptyStubsCount === 0) ok('Zero stubs vazios / un-implemented placeholders em suíte de testes');
  if (trivialAssertionsCount === 0) ok('Dogma Zero Verificado: Zero assercoes triviais / enganosas em testes');
}

function checkControllerTests() {
  console.log('\n🧪 Auditoria de Cobertura de Rotas (Controller vs Test):');
  const featuresDir = path.join(ROOT, 'src/features');
  if (!fs.existsSync(featuresDir)) return;

  const features = fs.readdirSync(featuresDir);
  for (const feat of features) {
    const featPath = path.join(featuresDir, feat);
    if (fs.statSync(featPath).isDirectory()) {
      const presentationDir = path.join(featPath, 'presentation');
      const testsDir = path.join(featPath, 'tests');

      if (fs.existsSync(presentationDir)) {
        const controllers = fs.readdirSync(presentationDir).filter(f => f.endsWith('-controller.ts'));
        for (const ctrl of controllers) {
          const hasTest = fs.existsSync(testsDir) && fs.readdirSync(testsDir, { recursive: true }).some(t => t.includes(ctrl.replace('-controller.ts', '')));
          if (hasTest) {
            ok(`Controller [${feat}/${ctrl}] possui testes associados`);
          } else {
            warn(`Controller [${feat}/${ctrl}] nao possui arquivo de teste unitario/integracao em tests/`);
          }
        }
      }
    }
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
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

// Auditoria Estática Real via AST oficial + Dogma Zero Evaluator
auditCodeQualityAST('src');
auditDogmaZeroHonesty();
checkControllerTests();

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
  console.error('❌ Repositorio NAO esta saudavel.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('⚠️  Funcional com avisos.');
  process.exit(0);
} else {
  console.log('🎉 100% saudavel! Pronto para vibe coding.');
  process.exit(0);
}
