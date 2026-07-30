// src/app/routes.ts

import { Router } from 'express';
import { prisma } from '@/shared/infrastructure/database';
import { asyncHandler } from '@/shared/http/async-handler';
import { TodoController } from '@/features/todo/presentation/todo-controller';
import { CreateTodoUseCase } from '@/features/todo/application/create-todo';
import { ListTodosUseCase } from '@/features/todo/application/list-todos';
import { PrismaTodoRepository } from '@/features/todo/infrastructure/todo-repository.prisma';

/**
 * Registro de todas as rotas da aplicacao.
 * Wiring: conecta infraestrutura -> aplicacao -> apresentacao.
 */

const router = Router();

// === Todo Feature ===
const todoRepository = new PrismaTodoRepository(prisma);
const createTodoUseCase = new CreateTodoUseCase(todoRepository);
const listTodosUseCase = new ListTodosUseCase(todoRepository);
const todoController = new TodoController(createTodoUseCase, listTodosUseCase);

router.post('/todos', asyncHandler((req, res) => todoController.create(req, res)));
router.get('/todos', asyncHandler((req, res) => todoController.list(req, res)));

// === Health Check ===
router.get(
  '/health',
  asyncHandler((_req, res) => {
    const checks = {
      database: 'up',
      timestamp: new Date().toISOString(),
    };
    res.json({ status: 'healthy', checks });
  }),
);

export default router;
