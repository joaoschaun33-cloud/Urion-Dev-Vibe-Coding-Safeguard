import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { prisma } from '@/shared/infrastructure/database';
import { redis } from '@/shared/infrastructure/redis';
import { logger } from '@/shared/infrastructure/logger';

// Todo Feature Imports
import { PrismaTodoRepository } from '@/features/todo/infrastructure/todo-repository.prisma';
import { CreateTodoUseCase } from '@/features/todo/application/create-todo';
import { ListTodosUseCase } from '@/features/todo/application/list-todos';
import { TodoController } from '@/features/todo/presentation/todo-controller';

// Project Health Feature Imports
import { InMemoryProjectHealthRepository } from '@/features/project-health/infrastructure/project-health-repository.memory';
import { CreateProjectHealthUseCase } from '@/features/project-health/application/create-project-health';
import { ProjectHealthController } from '@/features/project-health/presentation/project-health-controller';

// Spec Manager Feature Imports
import { InMemorySpecManagerRepository } from '@/features/spec-manager/infrastructure/spec-manager-repository.memory';
import { CreateSpecDocumentUseCase } from '@/features/spec-manager/application/create-spec-manager';
import { SpecManagerController } from '@/features/spec-manager/presentation/spec-manager-controller';

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Shared Infrastructure Singletons
  prisma: asValue(prisma),
  redis: asValue(redis),
  logger: asValue(logger),

  // Todo Feature Dependencies
  todoRepository: asClass(PrismaTodoRepository).singleton(),
  createTodoUseCase: asClass(CreateTodoUseCase).singleton(),
  listTodosUseCase: asClass(ListTodosUseCase).singleton(),
  todoController: asClass(TodoController).singleton(),

  // Project Health Feature Dependencies
  projectHealthRepository: asClass(InMemoryProjectHealthRepository).singleton(),
  createProjectHealthUseCase: asClass(CreateProjectHealthUseCase).singleton(),
  projectHealthController: asClass(ProjectHealthController).singleton(),

  // Spec Manager Feature Dependencies
  specManagerRepository: asClass(InMemorySpecManagerRepository).singleton(),
  createSpecDocumentUseCase: asClass(CreateSpecDocumentUseCase).singleton(),
  specManagerController: asClass(SpecManagerController).singleton(),
});
