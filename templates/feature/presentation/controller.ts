// src/features/__slug__/presentation/__slug__-controller.ts

import { Request, Response } from 'express';
import { Create__Name__UseCase } from '../application/create-__slug__';
import { Create__Name__Schema } from '../application/dto/create-__slug__.dto';
import { ProblemDetails } from '@/shared/http/problem-details';
import { logger } from '@/shared/infrastructure/logger';

/** Controller: adapta HTTP -> use case. Delega toda a logica. */
export class __Name__Controller {
  constructor(private readonly createUseCase: Create__Name__UseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = Create__Name__Schema.parse(req.body);
      const result = await this.createUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json(ProblemDetails.validationFailed(error, req.path));
        return;
      }
      logger.error({ event: 'CREATE___NAME___ERROR', error: (error as Error).message });
      throw error;
    }
  }
}
