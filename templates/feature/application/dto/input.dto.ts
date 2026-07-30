// src/features/<feature>/application/dto/create-entity.dto.ts

import { z } from 'zod';

/**
 * DTO de entrada: valida e tipa os dados que chegam ao use case.
 */

export const CreateEntitySchema = z.object({
  // Adicione seus campos validados aqui
  name: z.string().min(1).max(255),
  email: z.string().email(),
});

export type CreateEntityDTO = z.infer<typeof CreateEntitySchema>;
