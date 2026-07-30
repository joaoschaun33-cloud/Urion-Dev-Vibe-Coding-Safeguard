import crypto from 'node:crypto';

export type HealthStatus = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';

export interface HealthMetrics {
  testsPassing: number;
  totalTests: number;
  mdcRulesActive: number;
  architectureViolations: number;
}

export interface ProjectHealthProps {
  id?: string;
  projectName: string;
  score: number;
  status: HealthStatus;
  metrics: HealthMetrics;
  createdAt?: Date;
}

export class ProjectHealth {
  readonly id: string;
  readonly projectName: string;
  readonly score: number;
  readonly status: HealthStatus;
  readonly metrics: HealthMetrics;
  readonly createdAt: Date;

  private constructor(props: ProjectHealthProps) {
    this.id = props.id ?? crypto.randomUUID();
    this.projectName = props.projectName;
    this.score = props.score;
    this.status = props.status;
    this.metrics = props.metrics;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(
    props: Omit<ProjectHealthProps, 'id' | 'createdAt' | 'status' | 'score'>
  ): ProjectHealth {
    if (!props.projectName || props.projectName.trim().length === 0) {
      throw new Error('Project name is required');
    }

    const { score, status } = ProjectHealth.calculateScore(props.metrics);

    return new ProjectHealth({
      ...props,
      score,
      status,
    });
  }

  static restore(props: ProjectHealthProps): ProjectHealth {
    return new ProjectHealth(props);
  }

  private static calculateScore(metrics: HealthMetrics): { score: number; status: HealthStatus } {
    let score = 100;

    // Redução se houver testes falhando
    if (metrics.totalTests > 0) {
      const passRatio = metrics.testsPassing / metrics.totalTests;
      score -= Math.round((1 - passRatio) * 40);
    }

    // Redução severa para violações arquiteturais
    score -= metrics.architectureViolations * 20;

    // Bônus se houver regras MDC ativas
    if (metrics.mdcRulesActive < 3) {
      score -= 10;
    }

    score = Math.max(0, Math.min(100, score));

    let status: HealthStatus = 'EXCELLENT';
    if (score < 50) {
      status = 'CRITICAL';
    } else if (score < 75) {
      status = 'WARNING';
    } else if (score < 90) {
      status = 'GOOD';
    }

    return { score, status };
  }
}
