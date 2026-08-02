// src/features/blueprint-hub/presentation/blueprint-hub-controller.ts

import { Request, Response } from 'express';
import { CreateBlueprintUseCase } from '../application/create-blueprint';
import { IBlueprintHubRepository } from '../domain/blueprint-hub-repository.interface';
import { CreateBlueprintInput } from '../domain/blueprint-hub';

export class BlueprintHubController {
  constructor(
    private readonly createBlueprintUseCase: CreateBlueprintUseCase,
    private readonly blueprintHubRepository: IBlueprintHubRepository
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const payload = req.body as CreateBlueprintInput;
    const result = await this.createBlueprintUseCase.execute(payload);
    res.status(201).json(result);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const found = await this.blueprintHubRepository.findById(id);
    if (!found) {
      res.status(404).json({
        type: 'https://api.urion.dev/errors/not-found',
        title: 'Blueprint Nao Encontrado',
        status: 404,
        detail: `Nenhum blueprint encontrado com o ID: ${id}`,
      });
      return;
    }
    res.status(200).json({ success: true, data: found });
  }

  async list(_req: Request, res: Response): Promise<void> {
    const list = await this.blueprintHubRepository.listRecent();
    res.status(200).json({ success: true, total: list.length, data: list });
  }
}
