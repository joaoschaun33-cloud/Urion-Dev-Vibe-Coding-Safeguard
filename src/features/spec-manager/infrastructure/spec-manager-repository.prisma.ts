import { PrismaClient } from '@prisma/client';
import type { ISpecManagerRepository } from '../domain/spec-manager-repository.interface';
import { SpecDocument, SpecStatus } from '../domain/spec-manager';

export class PrismaSpecManagerRepository implements ISpecManagerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(spec: SpecDocument): Promise<SpecDocument> {
    const raw = await this.prisma.specDocument.upsert({
      where: { id: spec.id },
      update: {
        title: spec.title,
        filePath: spec.filePath,
        status: spec.status,
        acceptanceCriteriaCount: spec.acceptanceCriteriaCount,
        isValidated: spec.isValidated,
      },
      create: {
        id: spec.id,
        title: spec.title,
        filePath: spec.filePath,
        status: spec.status,
        acceptanceCriteriaCount: spec.acceptanceCriteriaCount,
        isValidated: spec.isValidated,
        createdAt: spec.createdAt,
      },
    });

    return SpecDocument.create({
      title: raw.title,
      filePath: raw.filePath,
      status: raw.status as SpecStatus,
      acceptanceCriteriaCount: raw.acceptanceCriteriaCount,
    });
  }

  async findById(id: string): Promise<SpecDocument | null> {
    const raw = await this.prisma.specDocument.findUnique({ where: { id } });
    if (!raw) {
      return null;
    }

    return SpecDocument.create({
      title: raw.title,
      filePath: raw.filePath,
      status: raw.status as SpecStatus,
      acceptanceCriteriaCount: raw.acceptanceCriteriaCount,
    });
  }

  async findAll(): Promise<SpecDocument[]> {
    const rawList = await this.prisma.specDocument.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return rawList.map((raw) =>
      SpecDocument.create({
        title: raw.title,
        filePath: raw.filePath,
        status: raw.status as SpecStatus,
        acceptanceCriteriaCount: raw.acceptanceCriteriaCount,
      })
    );
  }
}
