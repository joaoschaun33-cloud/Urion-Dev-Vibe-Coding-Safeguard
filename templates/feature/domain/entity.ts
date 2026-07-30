// src/features/<feature>/domain/<entity>.ts

import { z } from 'zod';

/**
 * Entidade de dominio pura.
 * Nao depende de frameworks, banco, ou HTTP.
 */

export const EntitySchema = z.object({
  id: z.string().uuid(),
  // Adicione seus campos aqui
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EntityProps = z.infer<typeof EntitySchema>;

export class Entity {
  private constructor(private readonly props: EntityProps) {}

  static create(props: Omit<EntityProps, 'id' | 'createdAt' | 'updatedAt'>): Entity {
    const now = new Date();
    return new Entity({
      id: crypto.randomUUID(),
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: EntityProps): Entity {
    return new Entity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
