import { z } from 'zod';

export const createProjectHealthSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  metrics: z.object({
    testsPassing: z.number().min(0),
    totalTests: z.number().min(0),
    mdcRulesActive: z.number().min(0),
    architectureViolations: z.number().min(0),
  }),
});

export type CreateProjectHealthDTO = z.infer<typeof createProjectHealthSchema>;
