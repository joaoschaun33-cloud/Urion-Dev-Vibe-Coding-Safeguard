// src/app/routes.ts

import { Router } from 'express';
import { asyncHandler } from '@/shared/http/async-handler';
import { container } from './container';

/**
 * Registro de todas as rotas da aplicacao.
 * Injeção de Dependências 100% Desacoplada via Awilix Container.
 */

const router = Router();

// Resolve Controllers dinamicamente do Awilix Container
const todoController = container.resolve('todoController');
const projectHealthController = container.resolve('projectHealthController');
const specManagerController = container.resolve('specManagerController');

// === Todo Feature ===
router.post(
  '/todos',
  asyncHandler((req, res) => todoController.create(req, res))
);
router.get(
  '/todos',
  asyncHandler((req, res) => todoController.list(req, res))
);

// === Project Health Feature ===
router.post(
  '/project-health',
  asyncHandler((req, res) => projectHealthController.create(req, res))
);
router.get(
  '/project-health',
  asyncHandler((req, res) => projectHealthController.list(req, res))
);

// === Spec Manager Feature ===
router.post(
  '/specs',
  asyncHandler((req, res) => specManagerController.create(req, res))
);
router.get(
  '/specs',
  asyncHandler((req, res) => specManagerController.list(req, res))
);

// Endpoint de Healthcheck da API
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    diContainer: 'awilix',
  });
});

export default router;
