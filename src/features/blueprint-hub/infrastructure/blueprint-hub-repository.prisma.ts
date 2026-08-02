// src/features/blueprint-hub/infrastructure/blueprint-hub-repository.prisma.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { IBlueprintHubRepository } from '../domain/blueprint-hub-repository.interface';
import { BlueprintEntity, CreateBlueprintInput } from '../domain/blueprint-hub';

export class PrismaBlueprintHubRepository implements IBlueprintHubRepository {
  private readonly memoryStore: Map<string, BlueprintEntity> = new Map();

  constructor(private readonly prisma: PrismaClient) {}

  async save(blueprintId: string, input: CreateBlueprintInput): Promise<BlueprintEntity> {
    const { project, blueprintVersion } = input;

    const entity: BlueprintEntity = {
      id: blueprintId,
      blueprintId,
      blueprintVersion: blueprintVersion || '2.0',
      projectName: project.name || 'unknown',
      architecture: project.architecture || 'Standard',
      stack: project.stack,
      featureCount: project.featureCount || 0,
      features: project.features,
      fileMetrics: project.fileMetrics,
      governance: project.governance,
      gitMetrics: project.gitMetrics,
      createdAt: new Date(),
    };

    try {
      const created = await this.prisma.blueprint.create({
        data: {
          blueprintId: entity.blueprintId,
          blueprintVersion: entity.blueprintVersion,
          projectName: entity.projectName,
          architecture: entity.architecture,
          stack: entity.stack as Prisma.InputJsonValue,
          featureCount: entity.featureCount,
          features: entity.features as Prisma.InputJsonValue,
          fileMetrics: entity.fileMetrics as Prisma.InputJsonValue,
          governance: entity.governance as Prisma.InputJsonValue,
          gitMetrics: entity.gitMetrics as Prisma.InputJsonValue,
        },
      });

      return {
        id: created.id,
        blueprintId: created.blueprintId,
        blueprintVersion: created.blueprintVersion,
        projectName: created.projectName,
        architecture: created.architecture,
        stack: created.stack as Record<string, unknown>,
        featureCount: created.featureCount,
        features: created.features as string[],
        fileMetrics: created.fileMetrics as Record<string, unknown>,
        governance: created.governance as Record<string, unknown>,
        gitMetrics: created.gitMetrics as Record<string, unknown>,
        createdAt: created.createdAt,
      };
    } catch {
      // Fallback em memória caso o banco PostgreSQL não esteja ativo em dev
      this.memoryStore.set(blueprintId, entity);
      return entity;
    }
  }

  async findById(blueprintId: string): Promise<BlueprintEntity | null> {
    try {
      const found = await this.prisma.blueprint.findUnique({
        where: { blueprintId },
      });
      if (!found) {
        return this.memoryStore.get(blueprintId) ?? null;
      }

      return {
        id: found.id,
        blueprintId: found.blueprintId,
        blueprintVersion: found.blueprintVersion,
        projectName: found.projectName,
        architecture: found.architecture,
        stack: found.stack as Record<string, unknown>,
        featureCount: found.featureCount,
        features: found.features as string[],
        fileMetrics: found.fileMetrics as Record<string, unknown>,
        governance: found.governance as Record<string, unknown>,
        gitMetrics: found.gitMetrics as Record<string, unknown>,
        createdAt: found.createdAt,
      };
    } catch {
      return this.memoryStore.get(blueprintId) ?? null;
    }
  }

  async listRecent(limit = 20): Promise<BlueprintEntity[]> {
    try {
      const list = await this.prisma.blueprint.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return list.map((found) => ({
        id: found.id,
        blueprintId: found.blueprintId,
        blueprintVersion: found.blueprintVersion,
        projectName: found.projectName,
        architecture: found.architecture,
        stack: found.stack as Record<string, unknown>,
        featureCount: found.featureCount,
        features: found.features as string[],
        fileMetrics: found.fileMetrics as Record<string, unknown>,
        governance: found.governance as Record<string, unknown>,
        gitMetrics: found.gitMetrics as Record<string, unknown>,
        createdAt: found.createdAt,
      }));
    } catch {
      return Array.from(this.memoryStore.values()).slice(0, limit);
    }
  }
}
