#!/usr/bin/env node
// Gera uma nova feature FSD a partir de templates/feature, com substituicao de tokens e AUTO-WIRING.
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
  ['module.ts', `${slug}.module.ts`],
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

// ==========================================
// AUTO-WIRING 1: Injeção de Dependência no container.ts
// ==========================================
const containerPath = path.join(ROOT, 'src', 'app', 'container.ts');
let containerContent = fs.readFileSync(containerPath, 'utf8');

const containerImportLine = `import { register${pascal}Module } from '@/features/${slug}/${slug}.module';\n`;
const containerRegisterLine = `register${pascal}Module(container);\n`;

if (!containerContent.includes(containerImportLine)) {
  // Inserir import após a última linha de import de módulo ou após logger
  const lastImportIndex = containerContent.lastIndexOf("import { register");
  if (lastImportIndex !== -1) {
    const endOfLine = containerContent.indexOf('\n', lastImportIndex) + 1;
    containerContent = containerContent.slice(0, endOfLine) + containerImportLine + containerContent.slice(endOfLine);
  } else {
    containerContent = containerImportLine + containerContent;
  }
}

if (!containerContent.includes(containerRegisterLine)) {
  containerContent += containerRegisterLine;
  fs.writeFileSync(containerPath, containerContent, 'utf8');
  console.log(`  ⚡ Auto-wired DI Container em ${path.relative(ROOT, containerPath)}`);
}

// ==========================================
// AUTO-WIRING 2: Registro de Rotas no routes.ts
// ==========================================
const routesPath = path.join(ROOT, 'src', 'app', 'routes.ts');
let routesContent = fs.readFileSync(routesPath, 'utf8');

const controllerClass = `${pascal}Controller`;
const controllerVar = `${camel}Controller`;
const routesImportLine = `import { ${controllerClass} } from '@/features/${slug}/presentation/${slug}-controller';\n`;
const routesResolveLine = `const ${controllerVar} = container.resolve<${controllerClass}>('${controllerVar}');\n`;
const routeEndpointBlock = `\n// === ${pascal} Feature ===\nrouter.post(\n  '/${slug}s',\n  asyncHandler((req, res) => ${controllerVar}.create(req, res))\n);\n`;

if (!routesContent.includes(routesImportLine)) {
  const routerLineIndex = routesContent.indexOf('const router = Router();');
  if (routerLineIndex !== -1) {
    routesContent = routesContent.slice(0, routerLineIndex) + routesImportLine + routesContent.slice(routerLineIndex);
  }
}

if (!routesContent.includes(routesResolveLine)) {
  const postRouterIndex = routesContent.indexOf('const router = Router();');
  if (postRouterIndex !== -1) {
    const endOfLine = routesContent.indexOf('\n', postRouterIndex) + 1;
    routesContent = routesContent.slice(0, endOfLine) + routesResolveLine + routesContent.slice(endOfLine);
  }
}

if (!routesContent.includes(`/${slug}s`)) {
  const healthCheckIndex = routesContent.indexOf("import { livenessCheck");
  if (healthCheckIndex !== -1) {
    routesContent = routesContent.slice(0, healthCheckIndex) + routeEndpointBlock + '\n' + routesContent.slice(healthCheckIndex);
  } else {
    routesContent += routeEndpointBlock;
  }
  fs.writeFileSync(routesPath, routesContent, 'utf8');
  console.log(`  ⚡ Auto-wired Rotas HTTP em ${path.relative(ROOT, routesPath)}`);
}

console.log(`\n🎉 Feature '${slug}' criada e conectada automaticamente (100% Auto-Wired)!`);
console.log(`  1. Teste executando: npm test`);
console.log(`  2. Para adicionar campos no banco: edite prisma/schema.prisma e troque repo memory por Prisma.`);
