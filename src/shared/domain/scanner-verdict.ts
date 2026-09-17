// src/shared/domain/scanner-verdict.ts
// Logica PURA do veredito do scanner tecnico. Sem I/O, sem framework (dominio puro).
// ESPELHADO em bin/lib/verdict.cjs (CommonJS, para o CLI zero-install via npx).
// Mantenha os dois em sincronia; o smoke test do scanner valida o comportamento do CLI.

export const COVERAGE_THRESHOLD = 80; // Dogma do projeto (AGENTS.md): cobertura minima.

export type ScannerStatus = 'EXCELENTE' | 'BOM' | 'ATENCAO' | 'CRITICO';

export interface DeriveStatusInput {
  healthScore: number;
  estimatedCoveragePct: number;
  /**
   * false (padrao) = nenhum relatorio real de cobertura foi encontrado (ver
   * bin/lib/coverage-reader.cjs, que le coverage/coverage-summary.json gerado
   * pela propria suite de testes do projeto). Isso NAO e "cobertura zero": e
   * "nao sabemos" — e por Dogma Zero, "nao sabemos" tambem nao pode receber o
   * selo "blindado". Ate 2026-09-17 esse numero vinha de uma proxy
   * (testFiles/codeFiles) que parecia uma medicao real e nao era — ver
   * docs/decisions-log.md.
   */
  coverageMeasured?: boolean;
  criticalCount?: number;
  coverageThreshold?: number;
}

export interface ScannerVerdict {
  status: ScannerStatus;
  capped: boolean;
  reason: string | null;
  shielded: boolean; // true SOMENTE quando pode declarar "projeto blindado".
}

const RANK: Record<ScannerStatus, number> = {
  CRITICO: 0,
  ATENCAO: 1,
  BOM: 2,
  EXCELENTE: 3,
};

/**
 * Deriva o status final combinando governanca (presenca) com qualidade real.
 * REGRA ANTI-FALSO-VERDE: o status nao pode exceder ATENCAO se a cobertura nao
 * foi medida de verdade, estiver abaixo do limite, OU se houver problema critico.
 */
export function deriveStatus(input: DeriveStatusInput): ScannerVerdict {
  const {
    healthScore,
    estimatedCoveragePct,
    coverageMeasured = true,
    criticalCount = 0,
    coverageThreshold = COVERAGE_THRESHOLD,
  } = input;

  let base: ScannerStatus;
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
  let reason: string | null = null;

  if (mustCap && RANK[base] > RANK.ATENCAO) {
    status = 'ATENCAO';
    capped = true;
    const reasons: string[] = [];
    if (coverageLow) {
      if (!coverageMeasured) {
        reasons.push(
          'cobertura nao medida (nenhum relatorio real encontrado — rode seus testes com --coverage)'
        );
      } else {
        reasons.push(
          `cobertura ${String(estimatedCoveragePct)}% < ${String(coverageThreshold)}% exigido`
        );
      }
    }
    if (hasCritical) {
      reasons.push(`${String(criticalCount)} problema(s) critico(s)`);
    }
    reason = `Rebaixado: ${reasons.join(' e ')}.`;
  }

  const shielded = status === 'EXCELENTE' && !capped;

  return { status, capped, reason, shielded };
}
