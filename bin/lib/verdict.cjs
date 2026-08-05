// bin/lib/verdict.cjs
// ESPELHO CommonJS de src/shared/domain/scanner-verdict.ts (para o CLI zero-install).
// Mantenha em sincronia. O smoke test do scanner valida o comportamento aqui.

const COVERAGE_THRESHOLD = 80;

function computeEstimatedCoverage(files) {
  const codeFiles = (files && files.codeFiles) || 0;
  const testFiles = (files && files.testFiles) || 0;
  if (codeFiles <= 0) {
    return 0;
  }
  return Math.round((testFiles / codeFiles) * 100);
}

const RANK = { CRITICO: 0, ATENCAO: 1, BOM: 2, EXCELENTE: 3 };

function deriveStatus(input) {
  const {
    healthScore,
    estimatedCoveragePct,
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

  const coverageLow = estimatedCoveragePct < coverageThreshold;
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
      reasons.push(`cobertura ${estimatedCoveragePct}% < ${coverageThreshold}% exigido`);
    }
    if (hasCritical) {
      reasons.push(`${criticalCount} problema(s) critico(s)`);
    }
    reason = `Rebaixado: ${reasons.join(' e ')}.`;
  }

  const shielded = status === 'EXCELENTE' && !capped;

  return { status, capped, reason, shielded };
}

module.exports = { computeEstimatedCoverage, deriveStatus, COVERAGE_THRESHOLD };
