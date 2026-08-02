// src/features/security-audit/tests/unit/scan-vibe-guard.test.ts

import { describe, it, expect } from 'vitest';
import { ScanVibeGuardUseCase } from '../../application/scan-vibe-guard';

describe('ScanVibeGuardUseCase', () => {
  it('deve realizar varredura VibeGuard e retornar score e diagnostico legivel', async () => {
    const useCase = new ScanVibeGuardUseCase();
    const rootDir = process.cwd();
    const result = await useCase.execute(rootDir);

    expect(result.scannedFilesCount).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(['SEGURO', 'ATENCAO', 'CRITICO']).toContain(result.status);
    expect(Array.isArray(result.issues)).toBe(true);
  });
});
