import fs from 'node:fs';
import path from 'node:path';
import { SpecDocument } from '../domain/spec-manager';

export interface ScannedSpecResult {
  title: string;
  filePath: string;
  totalCriteria: number;
  completedCriteria: number;
  progressPercentage: number;
  status: 'DRAFT' | 'APPROVED' | 'OUTDATED';
}

const SCAN_DIRECTORIES = ['00-context', '01-product', 'docs/00-context', 'docs/01-product'];

export function scanProjectSpecs(rootDir: string = process.cwd()): SpecDocument[] {
  const documents: SpecDocument[] = [];

  for (const dirName of SCAN_DIRECTORIES) {
    const dirPath = path.join(rootDir, dirName);
    if (!fs.existsSync(dirPath)) {
      continue;
    }

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'));

    for (const fileName of files) {
      const fullPath = path.join(dirPath, fileName);
      const relativePath = path.join(dirName, fileName).replace(/\\/g, '/');
      const content = fs.readFileSync(fullPath, 'utf-8');

      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : fileName;

      // Contar checkboxes markdown: - [ ] e - [x]
      const totalMatches = content.match(/- \[[ xX]\]/g) ?? [];
      const completedMatches = content.match(/- \[[xX]\]/g) ?? [];

      const totalCriteria = totalMatches.length;
      const completedCriteria = completedMatches.length;

      let status: 'DRAFT' | 'APPROVED' | 'OUTDATED' = 'DRAFT';
      if (totalCriteria > 0 && completedCriteria === totalCriteria) {
        status = 'APPROVED';
      } else if (totalCriteria > 0 && completedCriteria > 0) {
        status = 'DRAFT';
      }

      const doc = SpecDocument.create({
        title,
        filePath: relativePath,
        acceptanceCriteriaCount: totalCriteria,
        status,
      });

      documents.push(doc);
    }
  }

  return documents;
}
