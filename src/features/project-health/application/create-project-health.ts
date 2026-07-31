import type { IProjectHealthRepository } from '../domain/project-health-repository.interface';
import { ProjectHealth } from '../domain/project-health';
import type { CreateProjectHealthDTO } from './dto/create-project-health.dto';
import {
  toProjectHealthResponseDTO,
  type ProjectHealthResponseDTO,
} from './dto/project-health-response.dto';

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
