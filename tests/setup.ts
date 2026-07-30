// tests/setup.ts

import { vi } from 'vitest';

/**
 * Setup global para testes.
 */

// Mock do logger para nao poluir output dos testes
vi.mock('@/shared/infrastructure/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock do crypto.randomUUID para testes deterministicos
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
});

// Reset counter before each test
beforeEach(() => {
  uuidCounter = 0;
});
