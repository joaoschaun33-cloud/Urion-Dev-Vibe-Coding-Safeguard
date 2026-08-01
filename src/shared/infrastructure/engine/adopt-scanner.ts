/**
 * 🩹 Urion Adopt Scanner (Modo Resgate de Projetos Existentes)
 *
 * Faz o Raio-X de projetos existentes (Lovable, Bolt, v0, etc.),
 * mapeia arquivos gigantes (God Files) e gera o Mapa de Mina de segurança.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface AdoptScanResult {
  isExistingProject: boolean;
  godFiles: string[];
  detectedStack: string[];
  safetyMap: {
    safeZones: string[];
    warningZones: string[];
    dangerZones: string[];
  };
}

export function scanExistingProject(rootDir: string = process.cwd()): AdoptScanResult {
  const godFiles: string[] = [];
  const detectedStack: string[] = [];
  const dangerZones: string[] = [];
  const warningZones: string[] = [];
  const safeZones: string[] = [];

  // Checa se a pasta possui arquivos de código
  const hasPackageJson = fs.existsSync(path.join(rootDir, 'package.json'));
  const hasAppFile =
    fs.existsSync(path.join(rootDir, 'src', 'App.tsx')) ||
    fs.existsSync(path.join(rootDir, 'src', 'App.jsx'));

  if (!hasPackageJson && !hasAppFile) {
    return {
      isExistingProject: false,
      godFiles: [],
      detectedStack: [],
      safetyMap: { safeZones: [], warningZones: [], dangerZones: [] },
    };
  }

  // Detecção de Stack
  if (fs.existsSync(path.join(rootDir, 'src', 'integrations', 'supabase'))) {
    detectedStack.push('Lovable / Supabase');
  }
  if (fs.existsSync(path.join(rootDir, 'prisma', 'schema.prisma'))) {
    detectedStack.push('Prisma ORM');
  }

  // Scanner de God Files (> 500 linhas)
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      if (
        file.endsWith('.tsx') ||
        file.endsWith('.ts') ||
        file.endsWith('.jsx') ||
        file.endsWith('.js')
      ) {
        const filePath = path.join(srcDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          const lines = fs.readFileSync(filePath, 'utf-8').split('\n').length;
          if (lines > 500) {
            godFiles.push(`src/${file} (${String(lines)} linhas)`);
            dangerZones.push(`src/${file}`);
          } else {
            warningZones.push(`src/${file}`);
          }
        }
      }
    }
  }

  safeZones.push('src/features/* (Novas funcionalidades)');

  return {
    isExistingProject: true,
    godFiles,
    detectedStack: detectedStack.length ? detectedStack : ['React / Node.js Generico'],
    safetyMap: {
      safeZones,
      warningZones,
      dangerZones: dangerZones.length ? dangerZones : ['src/App.tsx'],
    },
  };
}
