import { createContainer, asValue, InjectionMode } from 'awilix';
import { prisma } from '@/shared/infrastructure/database';
import { redis } from '@/shared/infrastructure/redis';
import { logger } from '@/shared/infrastructure/logger';

import { registerTodoModule } from '@/features/todo/todo.module';
import { registerProjectHealthModule } from '@/features/project-health/project-health.module';
import { registerSpecManagerModule } from '@/features/spec-manager/spec-manager.module';
import { registerSecurityAuditModule } from '@/features/security-audit/security-audit.module';
import { registerBlueprintHubModule } from '@/features/blueprint-hub/blueprint-hub.module';

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

// Registra Infraestrutura Compartilhada
container.register({
  prisma: asValue(prisma),
  redis: asValue(redis),
  logger: asValue(logger),
});

// Registra Módulos de Feature via Registry Pattern
registerTodoModule(container);
registerProjectHealthModule(container);
registerSpecManagerModule(container);
registerSecurityAuditModule(container);
registerBlueprintHubModule(container);
