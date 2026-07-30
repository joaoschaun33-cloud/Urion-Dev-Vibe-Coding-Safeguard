import type { ProjectHealth } from './project-health.js';

export interface IProjectHealthRepository {
  save(health: ProjectHealth): Promise<ProjectHealth>;
  findById(id: string): Promise<ProjectHealth | null>;
  findLatest(): Promise<ProjectHealth | null>;
  findAll(): Promise<ProjectHealth[]>;
}
