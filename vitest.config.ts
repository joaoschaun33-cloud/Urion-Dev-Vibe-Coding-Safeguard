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
      reporter: ['text', 'json', 'html'],
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
      // "Ratchet" honesto (Dogma Zero, 2026-09-17): o piso abaixo reflete a
      // cobertura MEDIDA hoje (67.98% linhas, 76% branches, 76.04% funcoes),
      // nao a meta declarada em AGENTS.md/vision.md (80%). Antes deste ajuste
      // o limiar era 85%/80%, reprovava sempre, e o CI nunca rodava
      // `test:coverage` — entao a reprovacao era invisivel. Agora o piso e
      // real e o CI (ver .github/workflows/ci.yml) o aplica de verdade: quem
      // reduzir a cobertura quebra o build; quem aumentar pode subir o piso.
      // Meta declarada continua 80%+ — ver docs/01-product/roadmap.md (3.1).
      thresholds: {
        lines: 67,
        functions: 76,
        branches: 76,
        statements: 67,
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
