import { AwilixContainer, asClass } from 'awilix';
import { PrismaSpecManagerRepository } from './infrastructure/spec-manager-repository.prisma';
import { CreateSpecDocumentUseCase } from './application/create-spec-manager';
import { SpecManagerController } from './presentation/spec-manager-controller';

export function registerSpecManagerModule(container: AwilixContainer): void {
  container.register({
    specManagerRepository: asClass(PrismaSpecManagerRepository).singleton(),
    createSpecDocumentUseCase: asClass(CreateSpecDocumentUseCase).singleton(),
    specManagerController: asClass(SpecManagerController).singleton(),
  });
}
