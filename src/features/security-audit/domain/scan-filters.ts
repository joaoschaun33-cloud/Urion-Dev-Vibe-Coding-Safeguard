// src/features/security-audit/domain/scan-filters.ts
// Filtros para reduzir falso positivo: ignorar arquivos de teste/fixture e
// reconhecer valores obviamente falsos (mock/exemplo). Puro (dominio).

const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/i;
const FIXTURE_DIR = /(?:^|\/)(?:__mocks__|__fixtures__|__tests__|fixtures|mocks)\//i;

/** true se o caminho e de teste ou fixture (nao deve gerar flag de secret). */
export function isTestOrFixturePath(path: string): boolean {
  const p = path.replace(/\\/g, '/');
  return TEST_FILE.test(p) || FIXTURE_DIR.test(p);
}

const MOCK_VALUE =
  /\b(?:mock|fake|dummy|example|exemplo|placeholder|changeme|your[_-]?(?:api[_-]?)?key|test[_-]?key|xxx+)/i;

/** true se o valor parece um placeholder/exemplo (nao um segredo real). */
export function looksLikeMockValue(value: string): boolean {
  return MOCK_VALUE.test(value);
}
