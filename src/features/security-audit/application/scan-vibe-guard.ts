// src/features/security-audit/application/scan-vibe-guard.ts

import fs from 'fs';
import path from 'path';
import { VIBE_GUARD_RULES, VibeGuardIssue, VibeGuardReport } from '../domain/vibe-guard-rules';
import {
  isFirebaseWebConfigLine,
  isStaticMultilineTemplate,
  isTestOrFixturePath,
  looksGeneratedContent,
  looksLikeMockValue,
} from '../domain/scan-filters';
import { findEnvSecrets, isEnvFileName } from '../domain/env-secrets';

// Limitador de tentativas montado globalmente (app.use(limiter) / app.use('/api', rateLimit(...))):
// protege as rotas de login que o regex por linha nao consegue ligar ao limitador.
const GLOBAL_LIMITER_RE =
  /\.use\(\s*(?:['"`][^'"`]*['"`]\s*,\s*)?[^)]*\b\w*(?:limiter|ratelimit)\w*/i;

export class ScanVibeGuardUseCase {
  execute(targetDir: string): Promise<VibeGuardReport> {
    let issues: VibeGuardIssue[] = [];
    const limiter = { found: false };
    const filesToScan = this.collectFiles(targetDir);

    for (const filePath of filesToScan) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const isEnv = isEnvFileName(path.basename(filePath));
        // Bundle/minificado nao e o codigo do projeto: so procura segredo ali (achado de alta
        // confianca), nunca XSS/SQL/etc. (ruido). Uma linha longa (SQL embutido) NAO pode esconder um token.
        const generated = !isEnv && looksGeneratedContent(content);
        const relPath = path.relative(targetDir, filePath).replace(/\\/g, '/');

        const addIssue = (
          rule: (typeof VIBE_GUARD_RULES)[number],
          lineNumber: number,
          snippet: string
        ): void => {
          issues.push({
            id: `vg-${rule.id.toLowerCase()}-${String(issues.length + 1)}`,
            ruleId: rule.id,
            severity: rule.severity,
            title: rule.title,
            descriptionLeiga: rule.descriptionLeiga,
            riscoReal: rule.riscoReal,
            recomendacaoLeiga: rule.recomendacaoLeiga,
            filePath: relPath,
            lineNumber,
            snippet,
            autoFixable: rule.autoFixable,
            // fixCommand omitido de proposito: o comando `fix` ainda NAO existe.
            // Anunciar um comando inexistente viola o Dogma Zero. Sera preenchido
            // quando o auto-fix real for implementado (ver roadmap, backlog).
          });
        };

        if (isEnv) {
          // .env: so a logica propria (respeita variaveis publicas VITE_*/NEXT_PUBLIC_*).
          // As regexes de codigo nao se aplicam: acusariam chave publica entre aspas.
          const secretRule = VIBE_GUARD_RULES.find((r) => r.id === 'SECRETS_HARDCODED');
          for (const hit of findEnvSecrets(content)) {
            if (secretRule) {
              addIssue(secretRule, hit.line, `${hit.key}=***`);
            }
          }
        } else {
          lines.forEach((line, index) => {
            if (GLOBAL_LIMITER_RE.test(line)) {
              limiter.found = true;
            }
            for (const rule of VIBE_GUARD_RULES) {
              if (generated && rule.id !== 'SECRETS_HARDCODED') {
                continue;
              }
              if (rule.regex.test(line)) {
                // Reduz falso positivo: valores obviamente falsos (mock/exemplo) e a apiKey
                // publica do Firebase Web.
                if (
                  rule.id === 'SECRETS_HARDCODED' &&
                  (looksLikeMockValue(line) || isFirebaseWebConfigLine(lines, index))
                ) {
                  continue;
                }
                // Template de varias linhas sem ${dado} no corpo: HTML estatico, nao injecao.
                if (rule.id === 'XSS_UNSANITIZED' && isStaticMultilineTemplate(lines, index)) {
                  continue;
                }
                addIssue(rule, index + 1, line.trim());
              }
            }
          });
        }
      } catch {
        // Ignora erros de leitura de arquivos individuais
      }
    }

    if (limiter.found) {
      issues = issues.filter((i) => i.ruleId !== 'RATE_LIMIT_MISSING');
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
    const allowedExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.cjs']);

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
          // Pastas ocultas (.vite, .cache, .turbo...) sao cache/gerado, nao o codigo do projeto.
          if (!ignoreDirs.has(item) && !item.startsWith('.')) {
            scan(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          const rel = path.relative(dir, fullPath);
          // Nao escaneia arquivos de teste/fixture (evita flag em chaves de exemplo).
          if ((allowedExts.has(ext) || isEnvFileName(item)) && !isTestOrFixturePath(rel)) {
            results.push(fullPath);
          }
        }
      }
    };

    scan(dir);
    return results;
  }
}
