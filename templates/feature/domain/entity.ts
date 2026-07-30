// src/features/__slug__/domain/__slug__.ts

import { randomUUID } from 'node:crypto';
import { z } from 'zod';

/** Entidade de dominio pura (sem framework/banco/HTTP). */
export const __Name__Schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255), // TODO: troque/adicione os campos reais da feature
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type __Name__Props = z.infer<typeof __Name__Schema>;

export const Create__Name__PropsSchema = __Name__Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Create__Name__Props = z.input<typeof Create__Name__PropsSchema>;

export class __Name__ {
  private constructor(private readonly props: __Name__Props) {}

  static create(input: Create__Name__Props): __Name__ {
    const parsed = Create__Name__PropsSchema.parse(input);
    const now = new Date();
    return new __Name__({ id: randomUUID(), ...parsed, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: __Name__Props): __Name__ {
    return new __Name__(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  toJSON(): __Name__Props { return { ...this.props }; }
}
