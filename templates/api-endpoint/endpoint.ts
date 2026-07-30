// src/features/<feature>/presentation/routes.ts

import { Router } from 'express';
import { EntityController } from './entity-controller';
import { CreateEntityUseCase } from '../application/create-entity';
import { PrismaEntityRepository } from '../infrastructure/entity-repository.impl';
import { prisma } from '@/shared/infrastructure/database';
import { authenticate } from '@/shared/middleware/auth';
import { rateLimit } from '@/shared/middleware/rate-limit';

/**
 * Rotas da feature.
 * Wiring: conecta infraestrutura -> aplicacao -> apresentacao.
 */

const router = Router();

const repository = new PrismaEntityRepository(prisma);
const createUseCase = new CreateEntityUseCase(repository);
const controller = new EntityController(createUseCase);

router.post(
  '/',
  authenticate,
  rateLimit({ windowMs: 60_000, max: 10 }),
  (req, res) => controller.create(req, res)
);

export default router;
