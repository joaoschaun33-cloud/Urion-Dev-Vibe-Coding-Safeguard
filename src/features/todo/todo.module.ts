import { AwilixContainer, asClass } from 'awilix';
import { PrismaTodoRepository } from './infrastructure/todo-repository.prisma';
import { CreateTodoUseCase } from './application/create-todo';
import { ListTodosUseCase } from './application/list-todos';
import { TodoController } from './presentation/todo-controller';

export function registerTodoModule(container: AwilixContainer): void {
  container.register({
    todoRepository: asClass(PrismaTodoRepository).singleton(),
    createTodoUseCase: asClass(CreateTodoUseCase).singleton(),
    listTodosUseCase: asClass(ListTodosUseCase).singleton(),
    todoController: asClass(TodoController).singleton(),
  });
}
