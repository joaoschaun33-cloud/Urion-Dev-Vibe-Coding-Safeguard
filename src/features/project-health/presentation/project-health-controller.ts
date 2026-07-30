import type { Request, Response } from 'express';
import type { CreateProjectHealthUseCase } from '../application/create-project-health.js';
import { createProjectHealthSchema } from '../application/dto/create-project-health.dto.js';
import type { IProjectHealthRepository } from '../domain/project-health-repository.interface.js';
import { toProjectHealthResponseDTO } from '../application/dto/project-health-response.dto.js';

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

  async list(req: Request, res: Response): Promise<void> {
    const list = await this.repository.findAll();
    res.json(list.map(toProjectHealthResponseDTO));
  }
}
