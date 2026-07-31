import { PrismaClient } from '@prisma/client';
import type { IProjectHealthRepository } from '../domain/project-health-repository.interface';
import { ProjectHealth, HealthStatus } from '../domain/project-health';

export class PrismaProjectHealthRepository implements IProjectHealthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(health: ProjectHealth): Promise<ProjectHealth> {
    const raw = await this.prisma.projectHealthReport.upsert({
      where: { id: health.id },
      update: {
        projectName: health.projectName,
        score: health.score,
        status: health.status,
        testsPassing: health.metrics.testsPassing,
        totalTests: health.metrics.totalTests,
        mdcRulesActive: health.metrics.mdcRulesActive,
        architectureViolations: health.metrics.architectureViolations,
      },
      create: {
        id: health.id,
        projectName: health.projectName,
        score: health.score,
        status: health.status,
        testsPassing: health.metrics.testsPassing,
        totalTests: health.metrics.totalTests,
        mdcRulesActive: health.metrics.mdcRulesActive,
        architectureViolations: health.metrics.architectureViolations,
        createdAt: health.createdAt,
      },
    });

    return ProjectHealth.restore({
      id: raw.id,
      projectName: raw.projectName,
      score: raw.score,
      status: raw.status as HealthStatus,
      metrics: {
        testsPassing: raw.testsPassing,
        totalTests: raw.totalTests,
        mdcRulesActive: raw.mdcRulesActive,
        architectureViolations: raw.architectureViolations,
      },
      createdAt: raw.createdAt,
    });
  }

  async findById(id: string): Promise<ProjectHealth | null> {
    const raw = await this.prisma.projectHealthReport.findUnique({ where: { id } });
    if (!raw) {
      return null;
    }

    return ProjectHealth.restore({
      id: raw.id,
      projectName: raw.projectName,
      score: raw.score,
      status: raw.status as HealthStatus,
      metrics: {
        testsPassing: raw.testsPassing,
        totalTests: raw.totalTests,
        mdcRulesActive: raw.mdcRulesActive,
        architectureViolations: raw.architectureViolations,
      },
      createdAt: raw.createdAt,
    });
  }

  async findLatest(): Promise<ProjectHealth | null> {
    const raw = await this.prisma.projectHealthReport.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!raw) {
      return null;
    }

    return ProjectHealth.restore({
      id: raw.id,
      projectName: raw.projectName,
      score: raw.score,
      status: raw.status as HealthStatus,
      metrics: {
        testsPassing: raw.testsPassing,
        totalTests: raw.totalTests,
        mdcRulesActive: raw.mdcRulesActive,
        architectureViolations: raw.architectureViolations,
      },
      createdAt: raw.createdAt,
    });
  }

  async findAll(): Promise<ProjectHealth[]> {
    const rawList = await this.prisma.projectHealthReport.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return rawList.map((raw) =>
      ProjectHealth.restore({
        id: raw.id,
        projectName: raw.projectName,
        score: raw.score,
        status: raw.status as HealthStatus,
        metrics: {
          testsPassing: raw.testsPassing,
          totalTests: raw.totalTests,
          mdcRulesActive: raw.mdcRulesActive,
          architectureViolations: raw.architectureViolations,
        },
        createdAt: raw.createdAt,
      })
    );
  }
}
