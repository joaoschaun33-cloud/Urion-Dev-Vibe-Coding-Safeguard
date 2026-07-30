// src/features/todo/application/dto/create-todo.dto.ts

import { z } from 'zod';

export const CreateTodoSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(255, 'Titulo muito longo'),
  description: z.string().max(1000, 'Descricao muito longa').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

/** Entrada (antes do parse): `priority` opcional — default aplicado no parse. */
export type CreateTodoInput = z.input<typeof CreateTodoSchema>;

/** Saida (apos o parse): todos os campos resolvidos. */
export type CreateTodoDTO = z.infer<typeof CreateTodoSchema>;
