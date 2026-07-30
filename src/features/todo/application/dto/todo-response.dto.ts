// src/features/todo/application/dto/todo-response.dto.ts

import { Todo } from '../../domain/todo';

export interface TodoResponseDTO {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mapper de dominio -> DTO de resposta.
 * Nome distinto do tipo para evitar redeclaracao (no-redeclare).
 */
export const TodoResponseMapper = {
  fromDomain(todo: Todo): TodoResponseDTO {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted,
      priority: todo.priority,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    };
  },

  fromDomainList(todos: Todo[]): TodoResponseDTO[] {
    return todos.map((t) => TodoResponseMapper.fromDomain(t));
  },
};
