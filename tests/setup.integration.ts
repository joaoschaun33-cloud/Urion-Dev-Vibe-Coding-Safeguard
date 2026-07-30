// tests/setup.integration.ts
// Setup por-arquivo dos testes de integracao: silencia o logger (sem tocar no banco).

import { vi } from 'vitest';

vi.mock('@/shared/infrastructure/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));
