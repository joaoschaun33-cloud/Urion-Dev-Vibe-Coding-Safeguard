// bin/lib/project-detector.cjs
// Detecta stack, arquitetura e features automaticamente

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function detectStack(projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : {};
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const stack = {
    runtime: 'Node.js',
    runtimeVersion: process.version,
    framework: null,
    frontend: null,
    database: null,
    orm: null,
    testing: [],
    styling: null,
    buildTool: null,
    hasTypescript: fs.existsSync(path.join(projectPath, 'tsconfig.json')),
    hasDocker: fs.existsSync(path.join(projectPath, 'docker-compose.yml')),
    hasPrisma: fs.existsSync(path.join(projectPath, 'prisma/schema.prisma')),
  };

  if (deps.express) stack.framework = 'Express';
  else if (deps.fastify) stack.framework = 'Fastify';
  else if (deps.nestjs) stack.framework = 'NestJS';
  else if (deps.next) stack.framework = 'Next.js';
  else if (deps['@remix-run/node']) stack.framework = 'Remix';

  if (deps.react || deps['react-dom']) stack.frontend = 'React';
  else if (deps.vue) stack.frontend = 'Vue';
  else if (deps.svelte) stack.frontend = 'Svelte';

  if (deps.prisma || stack.hasPrisma) stack.orm = 'Prisma';
  else if (deps.sequelize) stack.orm = 'Sequelize';
  else if (deps.typeorm) stack.orm = 'TypeORM';

  if (deps['@prisma/client'] || deps.pg) stack.database = 'PostgreSQL';
  else if (deps.mysql2) stack.database = 'MySQL';
  else if (deps.sqlite3) stack.database = 'SQLite';
  else if (deps.mongodb || deps.mongoose) stack.database = 'MongoDB';

  if (deps.vitest) stack.testing.push('Vitest');
  if (deps.jest) stack.testing.push('Jest');
  if (deps.cypress) stack.testing.push('Cypress');
  if (deps.playwright) stack.testing.push('Playwright');

  if (deps.vite) stack.buildTool = 'Vite';
  else if (deps.webpack) stack.buildTool = 'Webpack';
  else if (deps.turbopack) stack.buildTool = 'Turbopack';

  if (deps.tailwindcss) stack.styling = 'Tailwind CSS';
  else if (deps['styled-components']) stack.styling = 'Styled Components';

  return stack;
}

function detectArchitecture(projectPath) {
  const srcPath = path.join(projectPath, 'src');
  if (!fs.existsSync(srcPath)) return 'unknown';

  const entries = fs.readdirSync(srcPath, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  if (dirs.includes('features') && dirs.includes('shared')) return 'Feature-Sliced Design (FSD)';
  if (dirs.includes('domain') && dirs.includes('application') && dirs.includes('infrastructure')) return 'Clean Architecture';
  if (dirs.includes('controllers') && dirs.includes('models') && dirs.includes('services')) return 'MVC';
  if (dirs.includes('app') && dirs.includes('routes')) return 'Modular';

  return 'Standard';
}

function detectFeatures(projectPath) {
  const featuresPath = path.join(projectPath, 'src', 'features');
  if (!fs.existsSync(featuresPath)) return [];

  return fs.readdirSync(featuresPath, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

function countFiles(projectPath) {
  let total = 0;
  let codeFiles = 0;
  let testFiles = 0;

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.urion' || entry.name === 'dist') continue;
      if (entry.isDirectory()) {
        scan(full);
      } else {
        total++;
        if (/\.(ts|tsx|js|jsx|py|go|rs)$/.test(entry.name)) codeFiles++;
        if (/\.(test|spec)\./.test(entry.name)) testFiles++;
      }
    }
  }

  scan(projectPath);
  return { total, codeFiles, testFiles };
}

function getGitInfo(projectPath) {
  try {
    const remote = execSync('git remote get-url origin', { cwd: projectPath, encoding: 'utf8', timeout: 3000 }).trim();
    const branch = execSync('git branch --show-current', { cwd: projectPath, encoding: 'utf8', timeout: 3000 }).trim();
    const commits = execSync('git rev-list --count HEAD', { cwd: projectPath, encoding: 'utf8', timeout: 3000 }).trim();
    return { remote, branch, commits: parseInt(commits) };
  } catch {
    return { remote: null, branch: 'main', commits: 0 };
  }
}

function analyzeProject(projectPath) {
  const stack = detectStack(projectPath);
  const architecture = detectArchitecture(projectPath);
  const features = detectFeatures(projectPath);
  const files = countFiles(projectPath);
  const git = getGitInfo(projectPath);
  const rulesDir = path.join(projectPath, '.cursor', 'rules');
  const rulesCount = fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir).filter(f => f.endsWith('.mdc')).length : 0;

  return {
    name: path.basename(projectPath),
    path: projectPath,
    stack,
    architecture,
    features,
    files,
    git,
    rulesCount,
    hasSnapshot: fs.existsSync(path.join(projectPath, '.urion', 'snapshot')),
    hasCursorRules: fs.existsSync(path.join(projectPath, '.cursorrules')),
    hasAgentsMd: fs.existsSync(path.join(projectPath, 'AGENTS.md')),
  };
}

module.exports = { analyzeProject, detectStack, detectArchitecture, detectFeatures, countFiles };
