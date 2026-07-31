import { AwilixContainer, asClass } from 'awilix';
import { InMemory__Name__Repository } from './infrastructure/__slug__-repository.memory';
import { Create__Name__UseCase } from './application/create-__slug__';
import { __Name__Controller } from './presentation/__slug__-controller';

export function register__Name__Module(container: AwilixContainer): void {
  container.register({
    __name__Repository: asClass(InMemory__Name__Repository).singleton(),
    create__Name__UseCase: asClass(Create__Name__UseCase).singleton(),
    __name__Controller: asClass(__Name__Controller).singleton(),
  });
}
