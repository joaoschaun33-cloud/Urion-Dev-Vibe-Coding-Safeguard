// scripts/build-npm-package.mjs
// Monta .npm-package/: o pacote npm da FERRAMENTA (CLI + MCP + gates), separado
// do template SaaS que vive na raiz do repositorio. A raiz e "private" — so este
// diretorio e publicavel (npm run publish:tool).

import fs from 'node:fs';
import path from 'node:path';
import { builtinModules } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '.npm-package');
const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const SHIPPED_BINS = ['urion-safeguard.cjs', 'urion-checks.mjs', 'urion-mcp-server.mjs'];
// O bundle do MCP embute o SDK (que contem transports HTTP nao usados); os demais
// arquivos nao podem tocar a rede.
const NETWORK_EXEMPT = new Set(['urion-mcp-server.mjs']);
const NETWORK_RE = /require\(\s*['"](?:node:)?(?:https?|net|tls|dgram|http2)['"]\s*\)|from\s+['"](?:node:)?(?:https?|net|tls|dgram|http2)['"]|\bfetch\s*\(/;
const BUILTINS = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(full) : [full];
  });
}

// Em bundles esbuild (.mjs) so imports ESTATICOS contam: strings como
// 'require("ajv/...")' dentro do SDK sao codigo gerado (ajv standalone), nao um
// require executado. A prova final e instalar sem dependencias e rodar as tools.
function bareImports(source, bundled) {
  const found = new Set();
  const patterns = [
    /^\s*import\s[^'"\n]*from\s+['"]([^'"]+)['"]/gm,
    /^\s*import\s+['"]([^'"]+)['"]/gm,
    ...(bundled ? [] : [/\brequire\(\s*['"]([^'"]+)['"]\s*\)/g]),
  ];
  for (const re of patterns) {
    for (const m of source.matchAll(re)) {
      const spec = m[1];
      if (!spec.startsWith('.') && !spec.startsWith('/') && !BUILTINS.has(spec)) {
        found.add(spec);
      }
    }
  }
  return [...found];
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'bin', 'lib'), { recursive: true });

const shipped = [];
for (const name of SHIPPED_BINS) {
  const src = path.join(root, 'bin', name);
  if (!fs.existsSync(src)) {
    throw new Error(`Arquivo ausente: bin/${name} (rode npm run build:mcp / build:checks antes).`);
  }
  fs.copyFileSync(src, path.join(out, 'bin', name));
  shipped.push({ rel: `bin/${name}`, file: src, exemptNetwork: NETWORK_EXEMPT.has(name) });
}
for (const file of listFiles(path.join(root, 'bin', 'lib'))) {
  const rel = path.relative(path.join(root, 'bin'), file);
  fs.mkdirSync(path.dirname(path.join(out, 'bin', rel)), { recursive: true });
  fs.copyFileSync(file, path.join(out, 'bin', rel));
  shipped.push({ rel: `bin/${rel.split(path.sep).join('/')}`, file, exemptNetwork: false });
}
for (const doc of ['README.md', 'LICENSE', 'CHANGELOG.md']) {
  fs.copyFileSync(path.join(root, doc), path.join(out, doc));
}

const problems = [];
for (const item of shipped) {
  const source = fs.readFileSync(item.file, 'utf8');
  const bare = bareImports(source, item.file.endsWith('.mjs'));
  if (bare.length > 0) {
    problems.push(`${item.rel}: importa pacote(s) que nao viajam com a ferramenta: ${bare.join(', ')}`);
  }
  if (!item.exemptNetwork && NETWORK_RE.test(source)) {
    problems.push(`${item.rel}: usa API de rede (https/http/net/fetch) — a ferramenta deve rodar 100% local`);
  }
}
if (problems.length > 0) {
  console.error('Pacote da ferramenta reprovado:\n - ' + problems.join('\n - '));
  process.exit(1);
}

const manifest = {
  name: rootPkg.name,
  version: rootPkg.version,
  description:
    'Guardrails de governanca e seguranca para vibe coding: servidor MCP, CLI e gates de spec, launch e configuracao. Em portugues.',
  keywords: ['vibe-coding', 'mcp', 'model-context-protocol', 'security', 'governance', 'ai', 'cursor', 'claude', 'guardrails'],
  license: rootPkg.license,
  author: 'Joao Schaun',
  repository: { type: 'git', url: 'git+https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard.git' },
  homepage: 'https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard#readme',
  bugs: { url: 'https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard/issues' },
  type: 'module',
  bin: {
    'urion-safeguard': 'bin/urion-safeguard.cjs',
    urion: 'bin/urion-safeguard.cjs',
    'urion-mcp-server': 'bin/urion-mcp-server.mjs',
    'urion-checks': 'bin/urion-checks.mjs',
  },
  files: ['bin', 'CHANGELOG.md'],
  engines: rootPkg.engines,
};
fs.writeFileSync(path.join(out, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`Pacote da ferramenta montado em ${path.relative(root, out)} (${shipped.length} arquivos de codigo, 0 dependencias).`);
