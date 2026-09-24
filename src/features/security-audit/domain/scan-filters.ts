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

// Codigo gerado/minificado (bundle, chunk do Vite) nao e o codigo do projeto: uma linha enorme ou um
// arquivo gigante nao foi escrito a mao. Medido: 10 achados de XSS e 5 de catch vazio vinham de
// chunk-*.js e .vite/deps commitados. ESPELHADO em bin/lib/mode-maker.cjs (teste de paridade).
const MAX_HANDWRITTEN_BYTES = 200 * 1024;
const MAX_HANDWRITTEN_LINE = 1000;

export function looksGeneratedContent(content: string): boolean {
  return (
    content.length > MAX_HANDWRITTEN_BYTES ||
    content.split('\n').some((l) => l.length > MAX_HANDWRITTEN_LINE)
  );
}

// A apiKey do Firebase Web e publica POR DESIGN (documentacao do Firebase): nao e segredo. Reconhece
// o objeto de configuracao pelas chaves vizinhas. Medido: 5 de 19 achados de segredo eram isso.
const FIREBASE_SIBLING =
  /\b(?:authDomain|messagingSenderId|storageBucket|measurementId|databaseURL|appId)\b/;

export function isFirebaseWebConfigLine(lines: readonly string[], index: number): boolean {
  const from = Math.max(0, index - 8);
  const to = Math.min(lines.length, index + 9);
  return (
    /\bapiKey\b/.test(lines[index] ?? '') &&
    lines.slice(from, to).some((l) => FIREBASE_SIBLING.test(l))
  );
}

// Template literal aberto no fim da linha (innerHTML = `  /  document.write(`) cujo CORPO, ate o proximo
// backtick, nao tem "${": e HTML estatico (GTM, CSS, widget), nao injecao de dado. O regex por linha
// nao ve as linhas seguintes; o scanner chama esta funcao. Medido: 8 estaticos contra 4 com dado.
// ESPELHADO em bin/lib/mode-maker.cjs.
export function isStaticMultilineTemplate(lines: readonly string[], index: number): boolean {
  const line = lines[index] ?? '';
  const open = line.indexOf('`');
  if (open < 0 || line.slice(open + 1).includes('`')) {
    return false; // sem backtick, ou template que abre e fecha na mesma linha
  }
  let body = line.slice(open + 1);
  for (let i = index + 1; i < Math.min(lines.length, index + 2000); i++) {
    const next = lines[i] ?? '';
    const close = next.indexOf('`');
    if (close >= 0) {
      body += `\n${next.slice(0, close)}`;
      return !body.includes('${');
    }
    body += `\n${next}`;
  }
  return false; // sem fechamento encontrado: nao decide (mantem o achado)
}

/** Scripts avulsos (migracao, seed, utilitarios): rodam uma vez, nao sao o caminho de runtime do app. */
const DEV_SCRIPT_DIR = /(?:^|\/)(?:scripts?|bin|tools|migrations?|seeds?|seeders?)\//i;

export function isDevScriptPath(path: string): boolean {
  return DEV_SCRIPT_DIR.test(path.replace(/\\/g, '/'));
}
