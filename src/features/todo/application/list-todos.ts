// src/features/todo/application/list-todos.ts

import { ITodoRepository } from '../domain/todo-repository.interface';
import { TodoResponseDTO, TodoResponseMapper } from './dto/todo-response.dto';

/**
 * Use Case: Listar Todos com paginacao.
 */
export class ListTodosUseCase {
  constructor(private readonly repository: ITodoRepository) {}

  async execute({ page, limit }: { page: number; limit: number }): Promise<{
    todos: TodoResponseDTO[];
    total: number;
    pages: number;
    hasNext: boolean;
  }> {
    const [todos, total] = await Promise.all([
      this.repository.findAll({ page, limit }),
      this.repository.count(),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      todos: TodoResponseMapper.fromDomainList(todos),
      total,
      pages,
      hasNext: page < pages,
    };
  }
}
