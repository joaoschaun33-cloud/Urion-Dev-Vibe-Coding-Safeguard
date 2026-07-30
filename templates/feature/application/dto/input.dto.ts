// src/features/__slug__/application/dto/create-__slug__.dto.ts

import { z } from 'zod';

export const Create__Name__Schema = z.object({
  name: z.string().min(1).max(255), // TODO: campos de entrada da feature
});

/** Entrada (antes do parse). */
export type Create__Name__Input = z.input<typeof Create__Name__Schema>;
/** Saida (apos o parse). */
export type Create__Name__DTO = z.infer<typeof Create__Name__Schema>;
