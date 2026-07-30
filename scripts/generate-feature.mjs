#!/usr/bin/env node
// Gera uma nova feature FSD a partir de templates/feature, com substituicao de tokens.
// Uso: npm run generate:feature -- <nome-em-kebab-case>

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const slug = process.argv[2];
if (!slug || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Uso: npm run generate:feature -- <nome-em-kebab-case>');
  console.error('Ex.:  npm run generate:feature -- user-profile');
  process.exit(1);
}

const pascal = slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const camel = pascal[0].toLowerCase() + pascal.slice(1);
const CONST = slug.replace(/-/g, '_').toUpperCase();

const dst = path.join(ROOT, 'src', 'features', slug);
if (fs.existsSync(dst)) {
  console.error(`Feature '${slug}' ja existe em ${path.relative(ROOT, dst)}`);
  process.exit(1);
}

const TPL = path.join(ROOT, 'templates', 'feature');
const files = [
  ['domain/entity.ts', `domain/${slug}.ts`],
  ['domain/repository.interface.ts', `domain/${slug}-repository.interface.ts`],
  ['domain/errors.ts', 'domain/errors.ts'],
  ['application/use-case.ts', `application/create-${slug}.ts`],
  ['application/dto/input.dto.ts', `application/dto/create-${slug}.dto.ts`],
  ['application/dto/output.dto.ts', `application/dto/${slug}-response.dto.ts`],
  ['infrastructure/repository.impl.ts', `infrastructure/${slug}-repository.memory.ts`],
  ['presentation/controller.ts', `presentation/${slug}-controller.ts`],
  ['tests/unit/use-case.test.ts', `tests/unit/create-${slug}.test.ts`],
];

const subst = (s) =>
  s.replaceAll('__Name__', pascal)
    .replaceAll('__NAME__', CONST)
    .replaceAll('__name__', camel)
    .replaceAll('__slug__', slug);

console.log(`Gerando feature '${slug}' (${pascal})...`);
for (const [src, out] of files) {
  const content = subst(fs.readFileSync(path.join(TPL, src), 'utf8'));
  const outPath = path.join(dst, out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  console.log('  criado', path.relative(ROOT, outPath));
}

console.log(`\nFeature '${slug}' criada. Proximos passos:`);
console.log(`  1. Ajuste os campos reais em src/features/${slug}/domain/${slug}.ts e no DTO.`);
console.log(`  2. Registre a rota em src/app/routes.ts (use asyncHandler).`);
console.log(`  3. Persistencia: crie o modelo no prisma/schema.prisma e troque o repo`);
console.log(`     em memoria por Prisma (referencia: feature 'todo').`);
console.log(`  4. Rode: npm run build && npm run lint && npm test`);
