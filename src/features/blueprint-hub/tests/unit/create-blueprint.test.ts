// src/features/blueprint-hub/tests/unit/create-blueprint.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { CreateBlueprintUseCase } from '../../application/create-blueprint';
import { IBlueprintHubRepository } from '../../domain/blueprint-hub-repository.interface';
import { BlueprintEntity, CreateBlueprintInput } from '../../domain/blueprint-hub';

class MockBlueprintHubRepository implements IBlueprintHubRepository {
  public saved: BlueprintEntity[] = [];

  async save(blueprintId: string, input: CreateBlueprintInput): Promise<BlueprintEntity> {
    const entity: BlueprintEntity = {
      id: blueprintId,
      blueprintId,
      blueprintVersion: input.blueprintVersion,
      projectName: input.project.name,
      architecture: input.project.architecture,
      stack: input.project.stack,
      featureCount: input.project.featureCount,
      features: input.project.features,
      fileMetrics: input.project.fileMetrics,
      governance: input.project.governance,
      gitMetrics: input.project.gitMetrics,
      createdAt: new Date(),
    };
    this.saved.push(entity);
    return Promise.resolve(entity);
  }

  async findById(blueprintId: string): Promise<BlueprintEntity | null> {
    const found = this.saved.find((b) => b.blueprintId === blueprintId) ?? null;
    return Promise.resolve(found);
  }

  async listRecent(): Promise<BlueprintEntity[]> {
    return Promise.resolve(this.saved);
  }
}

describe('CreateBlueprintUseCase', () => {
  let repository: MockBlueprintHubRepository;
  let useCase: CreateBlueprintUseCase;

  beforeEach(() => {
    repository = new MockBlueprintHubRepository();
    useCase = new CreateBlueprintUseCase(repository);
  });

  it('deve criar e salvar um blueprint anonimizado com sucesso', async () => {
    const input: CreateBlueprintInput = {
      blueprintVersion: '2.0',
      project: {
        name: 'project-4a942815',
        architecture: 'Feature-Sliced Design (FSD)',
        stack: { runtime: 'Node.js', framework: 'Express' },
        featureCount: 2,
        features: ['feature-a518cb41', 'feature-8f9b6a74'],
        fileMetrics: { totalFiles: 100, codeFiles: 50, testFiles: 10, testRatio: 20 },
        governance: { hasCursorRules: true, hasAgentsMd: true, rulesCount: 5, hasSnapshot: true },
        gitMetrics: { commits: 42, hasRemote: true },
      },
    };

    const result = await useCase.execute(input);

    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^bp-[a-f0-9]{8}$/);
    expect(result.url).toBe(`https://api.urion.dev/blueprints/${result.id}`);
    expect(repository.saved.length).toBe(1);
    expect(repository.saved[0].projectName).toBe('project-4a942815');
  });
});
