import { AwilixContainer, asClass } from 'awilix';
import { PrismaProjectHealthRepository } from './infrastructure/project-health-repository.prisma';
import { CreateProjectHealthUseCase } from './application/create-project-health';
import { ProjectHealthController } from './presentation/project-health-controller';

export function registerProjectHealthModule(container: AwilixContainer): void {
  container.register({
    projectHealthRepository: asClass(PrismaProjectHealthRepository).singleton(),
    createProjectHealthUseCase: asClass(CreateProjectHealthUseCase).singleton(),
    projectHealthController: asClass(ProjectHealthController).singleton(),
  });
}
