// bin/lib/verdict.cjs
// ESPELHO CommonJS de src/shared/domain/scanner-verdict.ts (para o CLI zero-install).
// Mantenha em sincronia. O smoke test do scanner valida o comportamento aqui.

const COVERAGE_THRESHOLD = 80;

const RANK = { CRITICO: 0, ATENCAO: 1, BOM: 2, EXCELENTE: 3 };

/**
 * Deriva o status final combinando governanca (presenca) com qualidade real.
 * REGRA ANTI-FALSO-VERDE: o status nao pode exceder ATENCAO se a cobertura nao
 * foi medida de verdade, estiver abaixo do limite, OU se houver problema critico.
 *
 * `coverageMeasured=false` (padrao) significa "nenhum relatorio real de
 * cobertura foi encontrado" (ver bin/lib/coverage-reader.cjs) — isso NAO conta
 * como cobertura zero nem como cobertura ok; conta como "nao sabemos", que
 * tambem nao pode receber o selo "blindado" (Dogma Zero: nunca fingir certeza
 * que nao existe). Antes desta versao, a cobertura era estimada por uma proxy
 * (testFiles/codeFiles) que parecia uma medicao real e nao era — ver
 * decisions-log.md 2026-09-17.
 */
function deriveStatus(input) {
  const {
    healthScore,
    estimatedCoveragePct,
    coverageMeasured = true,
    criticalCount = 0,
    coverageThreshold = COVERAGE_THRESHOLD,
  } = input || {};

  let base;
  if (healthScore >= 90) {
    base = 'EXCELENTE';
  } else if (healthScore >= 70) {
    base = 'BOM';
  } else if (healthScore >= 50) {
    base = 'ATENCAO';
  } else {
    base = 'CRITICO';
  }

  const coverageLow = !coverageMeasured || estimatedCoveragePct < coverageThreshold;
  const hasCritical = criticalCount > 0;
  const mustCap = coverageLow || hasCritical;

  let status = base;
  let capped = false;
  let reason = null;

  if (mustCap && RANK[base] > RANK.ATENCAO) {
    status = 'ATENCAO';
    capped = true;
    const reasons = [];
    if (coverageLow) {
      if (!coverageMeasured) {
        reasons.push(
          'cobertura nao medida (nenhum relatorio real encontrado — rode seus testes com --coverage)'
        );
      } else {
        reasons.push(`cobertura ${estimatedCoveragePct}% < ${coverageThreshold}% exigido`);
      }
    }
    if (hasCritical) {
      reasons.push(`${criticalCount} problema(s) critico(s)`);
    }
    reason = `Rebaixado: ${reasons.join(' e ')}.`;
  }

  const shielded = status === 'EXCELENTE' && !capped;

  return { status, capped, reason, shielded };
}

module.exports = { deriveStatus, COVERAGE_THRESHOLD };
