// src/features/blueprint-hub/blueprint-hub.module.ts

import { AwilixContainer, asClass } from 'awilix';
import { PrismaBlueprintHubRepository } from './infrastructure/blueprint-hub-repository.prisma';
import { CreateBlueprintUseCase } from './application/create-blueprint';
import { BlueprintHubController } from './presentation/blueprint-hub-controller';

export function registerBlueprintHubModule(container: AwilixContainer): void {
  container.register({
    blueprintHubRepository: asClass(PrismaBlueprintHubRepository).singleton(),
    createBlueprintUseCase: asClass(CreateBlueprintUseCase).singleton(),
    blueprintHubController: asClass(BlueprintHubController).singleton(),
  });
}
