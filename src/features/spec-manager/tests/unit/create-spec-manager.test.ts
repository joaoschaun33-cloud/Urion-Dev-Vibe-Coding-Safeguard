import { describe, expect, it } from 'vitest';
import { SpecDocument } from '../../domain/spec-manager.js';
import { CreateSpecDocumentUseCase } from '../../application/create-spec-manager.js';
import { InMemorySpecManagerRepository } from '../../infrastructure/spec-manager-repository.memory.js';
import { scanProjectSpecs } from '../../infrastructure/markdown-spec-scanner.js';

describe('SpecManager Feature Domain & Use Case', () => {
  it('deve criar uma especificação em status DRAFT', () => {
    const spec = SpecDocument.create({
      title: 'PRD Sistema de Autenticação',
      filePath: '00-context/prd-auth.md',
      acceptanceCriteriaCount: 4,
    });

    expect(spec.id).toBeDefined();
    expect(spec.status).toBe('DRAFT');
    expect(spec.isValidated).toBe(true);
  });

  it('deve aprovar uma especificação alterando seu status para APPROVED', () => {
    const spec = SpecDocument.create({
      title: 'Visao Geral do Produto',
      filePath: '00-context/vision.md',
      acceptanceCriteriaCount: 2,
    });

    const approved = spec.approve();
    expect(approved.status).toBe('APPROVED');
  });

  it('deve escanear os arquivos markdown reais do repositório', () => {
    const scanned = scanProjectSpecs();
    expect(scanned.length).toBeGreaterThan(0);
    const visionSpec = scanned.find((s) => s.filePath.includes('vision.md'));
    expect(visionSpec).toBeDefined();
  });

  it('deve sincronizar especificações escaneadas via UseCase', async () => {
    const repo = new InMemorySpecManagerRepository();
    const useCase = new CreateSpecDocumentUseCase(repo);

    const scanned = await useCase.scanAndSync();
    expect(scanned.length).toBeGreaterThan(0);
  });
});
