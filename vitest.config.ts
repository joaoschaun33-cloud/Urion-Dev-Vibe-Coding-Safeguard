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
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
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
