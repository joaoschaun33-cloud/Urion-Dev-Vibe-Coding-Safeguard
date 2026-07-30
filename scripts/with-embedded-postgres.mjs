// scripts/with-embedded-postgres.mjs
//
// Roda a suite de INTEGRACAO contra um Postgres EFEMERO em userland
// (sem Docker, sem admin). Sobe o banco, aplica o schema (via globalSetup),
// executa os testes e derruba tudo ao final.
//
//   npm run test:integration:local
//
// Requer a devDependency OPCIONAL `embedded-postgres`. Se ela nao estiver
// instalada, o script explica como proceder e sai com erro claro.

import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let EmbeddedPostgres;
try {
  const mod = await import('embedded-postgres');
  EmbeddedPostgres = mod.default?.default ?? mod.default ?? mod;
} catch {
  console.error(
    '\n[test:integration:local] "embedded-postgres" nao esta instalado.\n' +
      'Instale a devDependency opcional:  npm i -D embedded-postgres\n' +
      'Ou rode `npm run test:integration` com DATABASE_URL apontando para um Postgres real.\n',
  );
  process.exit(1);
}

const dataDir = join(tmpdir(), 'vibe-pg-itest');
const port = Number(process.env.TEST_PG_PORT ?? '5433');

rmSync(dataDir, { recursive: true, force: true });

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'vibeuser',
  password: 'vibepass',
  port,
  persistent: false,
});

let code = 0;
await pg.initialise();
await pg.start();
await pg.createDatabase('vibedb');

process.env.DATABASE_URL = `postgresql://vibeuser:vibepass@localhost:${port}/vibedb`;
console.log(`[test:integration:local] Postgres efemero em localhost:${port}\n`);

try {
  execSync('npx vitest run --config vitest.integration.config.ts', {
    stdio: 'inherit',
    env: process.env,
  });
} catch (err) {
  code = typeof err?.status === 'number' ? err.status : 1;
} finally {
  await pg.stop();
  rmSync(dataDir, { recursive: true, force: true });
}

process.exit(code);
