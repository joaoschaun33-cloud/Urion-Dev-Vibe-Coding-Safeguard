import { z } from 'zod';

export const createSpecDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  filePath: z.string().min(1, 'FilePath is required'),
  acceptanceCriteriaCount: z.number().min(0, 'Count must be non-negative'),
});

export type CreateSpecDocumentDTO = z.infer<typeof createSpecDocumentSchema>;
