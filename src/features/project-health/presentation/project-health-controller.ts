import type { Request, Response } from 'express';
import type { CreateProjectHealthUseCase } from '../application/create-project-health';
import { createProjectHealthSchema } from '../application/dto/create-project-health.dto';
import type { IProjectHealthRepository } from '../domain/project-health-repository.interface';
import { toProjectHealthResponseDTO } from '../application/dto/project-health-response.dto';

export class ProjectHealthController {
  constructor(
    private readonly createUseCase: CreateProjectHealthUseCase,
    private readonly repository: IProjectHealthRepository
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const dto = createProjectHealthSchema.parse(req.body);
    const result = await this.createUseCase.execute(dto);
    res.status(201).json(result);
  }

  async list(_req: Request, res: Response): Promise<void> {
    const list = await this.repository.findAll();
    res.json(list.map(toProjectHealthResponseDTO));
  }
}
