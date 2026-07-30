// tests/global-setup.integration.ts
// Roda UMA vez antes da suite de integracao: garante o schema no banco de teste.
// Exige DATABASE_URL (ex.: docker compose up -d postgres + .env).

import { execSync } from 'node:child_process';

export default function setup(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL nao definido. Suba o banco de teste (docker compose up -d postgres) ' +
        'e configure DATABASE_URL no .env antes de rodar os testes de integracao.',
    );
  }
  // Aplica o schema atual do Prisma ao banco de teste (idempotente).
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
  });
}
