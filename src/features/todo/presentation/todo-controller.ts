// src/features/todo/presentation/todo-controller.ts

import { Request, Response } from 'express';
import { CreateTodoUseCase } from '../application/create-todo';
import { ListTodosUseCase } from '../application/list-todos';
import { CreateTodoSchema } from '../application/dto/create-todo.dto';

/**
 * Controller: adapta HTTP para os use cases.
 * Delega TUDO para a camada de aplicacao.
 */
export class TodoController {
  constructor(
    private readonly createUseCase: CreateTodoUseCase,
    private readonly listUseCase: ListTodosUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const dto = CreateTodoSchema.parse(req.body);
    const result = await this.createUseCase.execute(dto);
    res.status(201).json(result);
  }

  async list(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const result = await this.listUseCase.execute({ page, limit });
    res.json(result);
  }
}
