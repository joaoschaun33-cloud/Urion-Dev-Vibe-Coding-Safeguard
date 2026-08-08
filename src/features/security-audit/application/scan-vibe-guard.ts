// src/features/security-audit/application/scan-vibe-guard.ts

import fs from 'fs';
import path from 'path';
import { VIBE_GUARD_RULES, VibeGuardIssue, VibeGuardReport } from '../domain/vibe-guard-rules';
import { isTestOrFixturePath, looksLikeMockValue } from '../domain/scan-filters';

export class ScanVibeGuardUseCase {
  execute(targetDir: string): Promise<VibeGuardReport> {
    const issues: VibeGuardIssue[] = [];
    const filesToScan = this.collectFiles(targetDir);

    for (const filePath of filesToScan) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          for (const rule of VIBE_GUARD_RULES) {
            if (rule.regex.test(line)) {
              // Reduz falso positivo: ignora valores obviamente falsos (mock/exemplo).
              if (rule.id === 'SECRETS_HARDCODED' && looksLikeMockValue(line)) {
                continue;
              }
              const relPath = path.relative(targetDir, filePath).replace(/\\/g, '/');
              issues.push({
                id: `vg-${rule.id.toLowerCase()}-${String(issues.length + 1)}`,
                ruleId: rule.id,
                severity: rule.severity,
                title: rule.title,
                descriptionLeiga: rule.descriptionLeiga,
                riscoReal: rule.riscoReal,
                recomendacaoLeiga: rule.recomendacaoLeiga,
                filePath: relPath,
                lineNumber: index + 1,
                snippet: line.trim(),
                autoFixable: rule.autoFixable,
                // fixCommand omitido de proposito: o comando `fix` ainda NAO existe.
                // Anunciar um comando inexistente viola o Dogma Zero. Sera preenchido
                // quando o auto-fix real for implementado (ver roadmap, backlog).
              });
            }
          }
        });
      } catch {
        // Ignora erros de leitura de arquivos individuais
      }
    }

    const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
    const warningCount = issues.filter((i) => i.severity === 'WARNING').length;

    // Calculo de pontuacao: 100 base, -20 por critico, -5 por warning (minimo 0)
    let score = 100 - criticalCount * 20 - warningCount * 5;
    if (score < 0) {
      score = 0;
    }

    let status: 'SEGURO' | 'ATENCAO' | 'CRITICO' = 'SEGURO';
    if (criticalCount > 0 || score < 70) {
      status = 'CRITICO';
    } else if (warningCount > 0 || score < 90) {
      status = 'ATENCAO';
    }

    return Promise.resolve({
      score,
      status,
      badgeEligible: score >= 90 && criticalCount === 0,
      totalIssues: issues.length,
      criticalCount,
      warningCount,
      issues,
      scannedFilesCount: filesToScan.length,
      timestamp: new Date().toISOString(),
    });
  }

  private collectFiles(dir: string): string[] {
    const results: string[] = [];
    const ignoreDirs = new Set([
      'node_modules',
      '.git',
      'dist',
      'build',
      '.urion',
      '.next',
      'coverage',
    ]);
    const allowedExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.env', '.mjs', '.cjs']);

    const scan = (currentDir: string): void => {
      let list: string[] = [];
      try {
        list = fs.readdirSync(currentDir);
      } catch {
        return;
      }

      for (const item of list) {
        const fullPath = path.join(currentDir, item);
        let stat: fs.Stats;
        try {
          stat = fs.statSync(fullPath);
        } catch {
          continue;
        }

        if (stat.isDirectory()) {
          if (!ignoreDirs.has(item)) {
            scan(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          const rel = path.relative(dir, fullPath);
          // Nao escaneia arquivos de teste/fixture (evita flag em chaves de exemplo).
          if (allowedExts.has(ext) && !isTestOrFixturePath(rel)) {
            results.push(fullPath);
          }
        }
      }
    };

    scan(dir);
    return results;
  }
}
