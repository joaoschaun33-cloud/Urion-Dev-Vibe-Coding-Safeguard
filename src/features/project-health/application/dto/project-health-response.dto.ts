import type { HealthMetrics, HealthStatus, ProjectHealth } from '../../domain/project-health.js';

export interface ProjectHealthResponseDTO {
  id: string;
  projectName: string;
  score: number;
  status: HealthStatus;
  metrics: HealthMetrics;
  createdAt: string;
}

export function toProjectHealthResponseDTO(health: ProjectHealth): ProjectHealthResponseDTO {
  return {
    id: health.id,
    projectName: health.projectName,
    score: health.score,
    status: health.status,
    metrics: health.metrics,
    createdAt: health.createdAt.toISOString(),
  };
}
