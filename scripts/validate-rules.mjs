#!/usr/bin/env node

/**
 * Validador de Regras MDC (.cursor/rules/*.mdc)
 * Verifica integridade do Frontmatter YAML (description, globs, alwaysApply)
 */

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const rulesDir = path.join(rootDir, '.cursor', 'rules');

if (!fs.existsSync(rulesDir)) {
  console.error('❌ Diretório de regras .cursor/rules/ não encontrado!');
  process.exit(1);
}

const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.mdc'));
let errorsCount = 0;

console.log('🔍 Validando estrutura de arquivos .mdc...\n');

for (const file of files) {
  const filePath = path.join(rulesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  if (!content.startsWith('---')) {
    console.error(`  ❌ [${file}] Falha: Cabeçalho YAML frontmatter ausente ('---').`);
    errorsCount++;
    continue;
  }

  const parts = content.split('---');
  if (parts.length < 3) {
    console.error(`  ❌ [${file}] Falha: Frontmatter YAML malformado.`);
    errorsCount++;
    continue;
  }

  const frontmatter = parts[1];
  const hasDescription = /description:\s*.+/i.test(frontmatter);
  const hasGlobs = /globs:\s*.+/i.test(frontmatter);
  const hasAlwaysApply = /alwaysApply:\s*(true|false)/i.test(frontmatter);

  if (!hasDescription || !hasGlobs || !hasAlwaysApply) {
    console.error(`  ❌ [${file}] Falha de Schema:`);
    if (!hasDescription) console.error(`      - Campo 'description' ausente ou vazio`);
    if (!hasGlobs) console.error(`      - Campo 'globs' ausente ou vazio`);
    if (!hasAlwaysApply) console.error(`      - Campo 'alwaysApply' ausente ou inválido`);
    errorsCount++;
  } else {
    console.log(`  ✅ [${file}] Válido.`);
  }
}

if (errorsCount > 0) {
  console.error(`\n🔴 Validação falhou com ${errorsCount} erro(s) em regras MDC.`);
  process.exit(1);
}

console.log('\n🎉 Todas as regras .mdc estão 100% válidas!');
