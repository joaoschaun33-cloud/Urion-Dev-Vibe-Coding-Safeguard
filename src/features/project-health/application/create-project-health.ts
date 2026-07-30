import type { IProjectHealthRepository } from '../domain/project-health-repository.interface.js';
import { ProjectHealth } from '../domain/project-health.js';
import type { CreateProjectHealthDTO } from './dto/create-project-health.dto.js';
import {
  toProjectHealthResponseDTO,
  type ProjectHealthResponseDTO,
} from './dto/project-health-response.dto.js';

export class CreateProjectHealthUseCase {
  constructor(private readonly repository: IProjectHealthRepository) {}

  async execute(dto: CreateProjectHealthDTO): Promise<ProjectHealthResponseDTO> {
    const health = ProjectHealth.create({
      projectName: dto.projectName,
      metrics: dto.metrics,
    });

    const saved = await this.repository.save(health);
    return toProjectHealthResponseDTO(saved);
  }
}
