// src/features/todo/application/create-todo.ts

import { ITodoRepository } from '../domain/todo-repository.interface';
import { Todo } from '../domain/todo';
import { CreateTodoSchema, CreateTodoInput } from './dto/create-todo.dto';
import { TodoResponseDTO, TodoResponseMapper } from './dto/todo-response.dto';
import { logger } from '@/shared/infrastructure/logger';

/**
 * Use Case: Criar um novo Todo.
 * Valida a entrada (aplicando defaults do Zod) antes de acionar o dominio.
 */
export class CreateTodoUseCase {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(input: CreateTodoInput): Promise<TodoResponseDTO> {
    const dto = CreateTodoSchema.parse(input);

    logger.info({ event: 'CREATE_TODO_STARTED', title: dto.title });

    const todo = Todo.create(dto);
    await this.repository.save(todo);

    logger.info({ event: 'CREATE_TODO_COMPLETED', todoId: todo.id });

    return TodoResponseMapper.fromDomain(todo);
  }
}
