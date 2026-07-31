import type { IProjectHealthRepository } from '../domain/project-health-repository.interface';
import type { ProjectHealth } from '../domain/project-health';

export class InMemoryProjectHealthRepository implements IProjectHealthRepository {
  private items: Map<string, ProjectHealth> = new Map();

  async save(health: ProjectHealth): Promise<ProjectHealth> {
    this.items.set(health.id, health);
    return Promise.resolve(health);
  }

  async findById(id: string): Promise<ProjectHealth | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  async findLatest(): Promise<ProjectHealth | null> {
    const list = Array.from(this.items.values());
    if (list.length === 0) {
      return Promise.resolve(null);
    }
    return Promise.resolve(list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]);
  }

  async findAll(): Promise<ProjectHealth[]> {
    return Promise.resolve(Array.from(this.items.values()));
  }

  clear(): void {
    this.items.clear();
  }
}
