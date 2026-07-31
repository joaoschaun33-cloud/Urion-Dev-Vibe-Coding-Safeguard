// src/features/todo/domain/todo-repository.interface.ts

import { Todo } from './todo';

export interface ITodoRepository {
  findById(id: string): Promise<Todo | null>;
  findAll(options: { page: number; limit: number }): Promise<Todo[]>;
  findManyWithCursor(options: { cursor?: string; limit: number }): Promise<Todo[]>;
  save(todo: Todo): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}
