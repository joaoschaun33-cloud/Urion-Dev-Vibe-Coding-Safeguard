import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'templates', 'checks', '**/*.integration.test.ts'],
    coverage: {
      provider: 'v8',
      all: true,
      // 'json-summary' gera coverage/coverage-summary.json (formato Istanbul),
      // que e o que o scanner do produto le como cobertura REAL (ver
      // bin/lib/coverage-reader.cjs) em vez de estimar por proxy.
      reporter: ['text', 'json', 'json-summary', 'html'],
      // Superficie de teste UNITARIO: dominio + aplicacao + apresentacao + shared/http.
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'templates/**',
        'tools/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.ts',
        '**/*.interface.ts',
        '**/index.ts',
        'src/app/**', // wiring (server/rotas) -> coberto por testes de integracao
        'src/pages/**', // camada de frontend (multi-stack)
        'src/shared/utils/**', // utilitarios de frontend
        'src/**/infrastructure/**', // adapters Prisma/DB -> testes de integracao
      ],
      // "Ratchet" honesto (Dogma Zero): o piso reflete a cobertura MEDIDA, com
      // pequena margem contra flutuacao entre execucoes. Historico: 2026-09-17 era
      // 67/75/75 (medido 67.9%); 2026-09-19 subiu para 84/90/85 (medido 84.49%
      // linhas, 85.77% branches, 91.81% funcoes) apos testes dos modulos que
      // estavam em 0%. A meta do AGENTS.md (80%) esta atingida; o CI
      // (.github/workflows/ci.yml) roda test:coverage, entao quem reduzir a
      // cobertura quebra o build. Suba o piso sempre que a cobertura subir.
      thresholds: {
        lines: 84,
        functions: 90,
        branches: 85,
        statements: 84,
      },
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
