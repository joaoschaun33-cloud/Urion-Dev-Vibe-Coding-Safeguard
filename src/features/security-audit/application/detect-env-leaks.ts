// src/features/security-audit/application/detect-env-leaks.ts
// Detector PURO: arquivos .env versionaveis (nao cobertos pelo .gitignore).
// Recebe o conteudo do .gitignore e a lista de arquivos .env presentes (I/O no CLI).

import { type Finding } from '../domain/findings';

const SAFE_ENV = new Set(['.env.example', '.env.sample', '.env.template']);

function gitignoreCoversEnv(gitignore: string): boolean {
  // Cobre padroes como ".env", ".env*", ".env.*"
  return /(^|\n)\s*\.env(\b|\*|\.)/.test(gitignore);
}

export function detectEnvLeaks(input: { gitignore: string; envFiles: string[] }): Finding[] {
  const findings: Finding[] = [];
  const covered = gitignoreCoversEnv(input.gitignore);

  for (const p of input.envFiles) {
    const base = p.split(/[\\/]/).pop() ?? p;
    if (SAFE_ENV.has(base)) {
      continue;
    }
    if (!covered) {
      findings.push({
        ruleId: 'ENV_NOT_IGNORED',
        severity: 'CRITICAL',
        file: p,
        message: `Arquivo "${base}" pode ir para o Git: .env* nao esta no .gitignore.`,
        remediation: 'Adicione ".env*" ao .gitignore e remova segredos do controle de versao.',
      });
    }
  }

  return findings;
}
