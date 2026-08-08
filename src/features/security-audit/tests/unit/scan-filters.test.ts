// src/features/security-audit/tests/unit/scan-filters.test.ts
import { describe, it, expect } from 'vitest';
import { isTestOrFixturePath, looksLikeMockValue } from '../../domain/scan-filters';

describe('isTestOrFixturePath', () => {
  it('reconhece arquivos de teste', () => {
    expect(isTestOrFixturePath('src/foo/bar.test.ts')).toBe(true);
    expect(isTestOrFixturePath('src/foo/bar.spec.tsx')).toBe(true);
    expect(isTestOrFixturePath('a\\b\\c.test.js')).toBe(true);
  });

  it('reconhece pastas de fixture/mocks', () => {
    expect(isTestOrFixturePath('src/__mocks__/api.ts')).toBe(true);
    expect(isTestOrFixturePath('test/fixtures/keys.json')).toBe(true);
  });

  it('nao marca codigo de producao', () => {
    expect(isTestOrFixturePath('src/features/auth/login.ts')).toBe(false);
  });
});

describe('looksLikeMockValue', () => {
  it('reconhece valores obviamente falsos', () => {
    expect(looksLikeMockValue('mockApiKey')).toBe(true);
    expect(looksLikeMockValue('YOUR_API_KEY')).toBe(true);
    expect(looksLikeMockValue('exemplo-de-chave')).toBe(true);
    expect(looksLikeMockValue('xxxxxxxx')).toBe(true);
  });

  it('nao marca um segredo real', () => {
    expect(looksLikeMockValue('sk_live_A1b2C3d4E5f6G7h8')).toBe(false);
  });
});
