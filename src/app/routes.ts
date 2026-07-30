// src/app/routes.ts

import { Router } from 'express';
import { prisma } from '@/shared/infrastructure/database';
import { asyncHandler } from '@/shared/http/async-handler';
import { TodoController } from '@/features/todo/presentation/todo-controller';
import { CreateTodoUseCase } from '@/features/todo/application/create-todo';
import { ListTodosUseCase } from '@/features/todo/application/list-todos';
import { PrismaTodoRepository } from '@/features/todo/infrastructure/todo-repository.prisma';

// Project Health Feature
import { ProjectHealthController } from '@/features/project-health/presentation/project-health-controller';
import { CreateProjectHealthUseCase } from '@/features/project-health/application/create-project-health';
import { InMemoryProjectHealthRepository } from '@/features/project-health/infrastructure/project-health-repository.memory';

// Spec Manager Feature
import { SpecManagerController } from '@/features/spec-manager/presentation/spec-manager-controller';
import { CreateSpecDocumentUseCase } from '@/features/spec-manager/application/create-spec-manager';
import { InMemorySpecManagerRepository } from '@/features/spec-manager/infrastructure/spec-manager-repository.memory';

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

router.post(
  '/todos',
  asyncHandler((req, res) => todoController.create(req, res))
);
router.get(
  '/todos',
  asyncHandler((req, res) => todoController.list(req, res))
);

// === Project Health Feature ===
const projectHealthRepository = new InMemoryProjectHealthRepository();
const createProjectHealthUseCase = new CreateProjectHealthUseCase(projectHealthRepository);
const projectHealthController = new ProjectHealthController(
  createProjectHealthUseCase,
  projectHealthRepository
);

router.post(
  '/project-health',
  asyncHandler((req, res) => projectHealthController.create(req, res))
);
router.get(
  '/project-health',
  asyncHandler((req, res) => projectHealthController.list(req, res))
);

// === Spec Manager Feature ===
const specRepository = new InMemorySpecManagerRepository();
const createSpecUseCase = new CreateSpecDocumentUseCase(specRepository);
const specController = new SpecManagerController(createSpecUseCase, specRepository);

router.post(
  '/specs',
  asyncHandler((req, res) => specController.create(req, res))
);
router.get(
  '/specs',
  asyncHandler((req, res) => specController.list(req, res))
);
router.get(
  '/specs/scan',
  asyncHandler((req, res) => specController.scan(req, res))
);

// === Health Check ===
router.get(
  '/health',
  asyncHandler((_req, res) => {
    const checks = {
      database: 'up',
      timestamp: new Date().toISOString(),
    };
    res.json({ status: 'healthy', checks });
  })
);

export default router;
