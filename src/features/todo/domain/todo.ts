// src/features/todo/domain/todo.ts

import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  isCompleted: z.boolean().default(false),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TodoProps = z.infer<typeof TodoSchema>;

/**
 * Schema de entrada para criacao: sem os campos gerados (id/timestamps).
 * `isCompleted` e `priority` sao opcionais na entrada — os defaults do Zod
 * sao aplicados no `create()` via parse. Fonte unica de validacao de dominio.
 */
export const CreateTodoPropsSchema = TodoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTodoProps = z.input<typeof CreateTodoPropsSchema>;

export class Todo {
  private constructor(private readonly props: TodoProps) {}

  static create(input: CreateTodoProps): Todo {
    // Aplica defaults e valida invariantes de dominio.
    const parsed = CreateTodoPropsSchema.parse(input);
    const now = new Date();
    return new Todo({
      id: randomUUID(),
      ...parsed,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: TodoProps): Todo {
    return new Todo(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get title(): string { return this.props.title; }
  get description(): string | undefined { return this.props.description; }
  get isCompleted(): boolean { return this.props.isCompleted; }
  get priority(): TodoProps['priority'] { return this.props.priority; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Metodos de dominio (imutaveis)
  complete(): Todo {
    return new Todo({ ...this.props, isCompleted: true, updatedAt: new Date() });
  }

  updateTitle(title: string): Todo {
    return new Todo({ ...this.props, title, updatedAt: new Date() });
  }

  toJSON(): TodoProps {
    return { ...this.props };
  }
}
