// src/features/<feature>/presentation/entity-controller.ts

import { Request, Response } from 'express';
import { CreateEntityUseCase } from '../application/create-entity';
import { CreateEntitySchema } from '../application/dto/create-entity.dto';
import { ValidationError } from '@/shared/errors';
import { ProblemDetails } from '@/shared/http/problem-details';

/**
 * Controller: adapta HTTP para o use case.
 * Max 20 linhas. Delega TUDO para a camada de aplicacao.
 */

export class EntityController {
  constructor(private readonly createUseCase: CreateEntityUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = CreateEntitySchema.parse(req.body);
      const result = await this.createUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json(ProblemDetails.validationFailed(error));
        return;
      }
      throw error;
    }
  }
}
