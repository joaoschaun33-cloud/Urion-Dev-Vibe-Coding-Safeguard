// src/app/routes.ts

import { Router } from 'express';
import { asyncHandler } from '@/shared/http/async-handler';
import { container } from './container';

/**
 * Registro de todas as rotas da aplicacao.
 * Injeção de Dependências 100% Desacoplada via Awilix Container.
 */

import { TodoController } from '@/features/todo/presentation/todo-controller';
import { ProjectHealthController } from '@/features/project-health/presentation/project-health-controller';
import { SpecManagerController } from '@/features/spec-manager/presentation/spec-manager-controller';
import { SecurityAuditController } from '@/features/security-audit/presentation/security-audit-controller';
import { BlueprintHubController } from '@/features/blueprint-hub/presentation/blueprint-hub-controller';

const router = Router();

// Resolve Controllers dinamicamente do Awilix Container
const todoController = container.resolve<TodoController>('todoController');
const projectHealthController =
  container.resolve<ProjectHealthController>('projectHealthController');
const specManagerController = container.resolve<SpecManagerController>('specManagerController');
const securityAuditController =
  container.resolve<SecurityAuditController>('securityAuditController');
const blueprintHubController = container.resolve<BlueprintHubController>('blueprintHubController');

// === Blueprint Hub Feature ===
router.post(
  '/blueprints',
  asyncHandler((req, res) => blueprintHubController.create(req, res))
);
router.get(
  '/blueprints',
  asyncHandler((req, res) => blueprintHubController.list(req, res))
);
router.get(
  '/blueprints/:id',
  asyncHandler((req, res) => blueprintHubController.getById(req, res))
);

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

// === Security Audit Feature (Complex Feature with Transactions & BullMQ) ===
router.post(
  '/security-audits',
  asyncHandler((req, res) => securityAuditController.create(req, res))
);
router.get(
  '/security-audits',
  asyncHandler((req, res) => securityAuditController.list(req, res))
);

import { livenessCheck, readinessCheck, deepHealthCheck } from '@/shared/http/health-check';
import { handleDeployQualityGateWebhook } from '@/shared/http/deploy-webhook';

// Endpoint de Quality Gate Webhook (Vercel / Netlify / Railway Pre-Deploy Gate)
router.post('/webhooks/deploy-quality-gate', asyncHandler(handleDeployQualityGateWebhook));

// Endpoints de Healthcheck (Kubernetes Standards)
router.get('/health', livenessCheck);
router.get('/health/live', livenessCheck);
router.get('/health/ready', asyncHandler(readinessCheck));
router.get('/health/deep', asyncHandler(deepHealthCheck));

export default router;
