import type { Request, Response } from 'express';
import type { CreateSpecDocumentUseCase } from '../application/create-spec-manager.js';
import { createSpecDocumentSchema } from '../application/dto/create-spec-manager.dto.js';
import type { ISpecManagerRepository } from '../domain/spec-manager-repository.interface.js';
import { toSpecDocumentResponseDTO } from '../application/dto/spec-manager-response.dto.js';

export class SpecManagerController {
  constructor(
    private readonly createUseCase: CreateSpecDocumentUseCase,
    private readonly repository: ISpecManagerRepository
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const dto = createSpecDocumentSchema.parse(req.body);
    const result = await this.createUseCase.execute(dto);
    res.status(201).json(result);
  }

  async list(_req: Request, res: Response): Promise<void> {
    const list = await this.repository.findAll();
    res.json(list.map(toSpecDocumentResponseDTO));
  }
}
