// bin/lib/coverage-reader.cjs
// Le a cobertura de testes REAL de um projeto de terceiro, a partir do relatorio
// que a propria suite de testes do projeto ja gerou (formato Istanbul
// coverage-summary.json, usado por Vitest, Jest, nyc, c8). NAO executa nenhum
// comando no projeto do usuario (risco/tempo de rodar teste alheio) — so le um
// arquivo, se existir. Se nao existir, retorna null: melhor admitir que a
// cobertura nao foi medida do que estimar por proxy (ver ADR/decisions-log
// 2026-09-17: "Ratchet de cobertura" e achado do roadmap item 3.1).

const fs = require('fs');
const path = require('path');

// Forward slash fixo (nao path.join) para a mensagem ficar igual em qualquer SO.
const SUMMARY_RELATIVE_PATH = 'coverage/coverage-summary.json';

function readRealCoverage(projectPath) {
  const summaryPath = path.join(projectPath, SUMMARY_RELATIVE_PATH);
  if (!fs.existsSync(summaryPath)) {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  } catch {
    return null;
  }

  const lines = parsed && parsed.total && parsed.total.lines;
  if (!lines || typeof lines.pct !== 'number' || Number.isNaN(lines.pct)) {
    return null;
  }

  let generatedAt = null;
  try {
    generatedAt = fs.statSync(summaryPath).mtime.toISOString();
  } catch {
    generatedAt = null;
  }

  return {
    pct: Math.round(lines.pct),
    source: SUMMARY_RELATIVE_PATH,
    generatedAt,
  };
}

module.exports = { readRealCoverage, SUMMARY_RELATIVE_PATH };
