/**
 * 🚪 Deploy Quality Gate Webhook Handler
 *
 * Handler de Webhook para integrar plataformas de deploy (Vercel, Netlify, Railway, GitHub Actions).
 * Executa a validação de segurança e qualidade do projeto antes do deploy final.
 *
 * Retorna:
 * - 200 OK (passed: true): Projeto 100% aprovado pelo Urion Safeguard. Deploy liberado.
 * - 422 Unprocessable Entity (passed: false): Falha no Quality Gate. Deploy bloqueado por razões de segurança.
 * - 401 Unauthorized: Assinatura/Secret do Webhook inválida.
 */

import { Request, Response } from 'express';
import { logger } from '@/shared/infrastructure/logger';
import { NoCodeArtifactScanner } from '@/shared/infrastructure/scanners/no-code-scanner';

export interface DeployWebhookPayload {
  provider: 'vercel' | 'netlify' | 'railway' | 'github_actions' | 'generic';
  projectId?: string;
  commitHash?: string;
  environment?: string;
  artifacts?: Array<{
    fileName: string;
    content: string;
  }>;
}

export const handleDeployQualityGateWebhook = (req: Request, res: Response): void => {
  const webhookSecret = process.env.DEPLOY_WEBHOOK_SECRET;
  const providedSecret = req.headers['x-urion-webhook-secret'] as string | undefined;

  // Validação de segurança do Webhook (se secret configurado)
  if (webhookSecret && providedSecret !== webhookSecret) {
    const payloadBody = req.body as Record<string, unknown> | undefined;
    logger.warn({ event: 'DEPLOY_WEBHOOK_UNAUTHORIZED', provider: payloadBody?.provider });
    res.status(401).json({
      status: 401,
      title: 'Unauthorized Webhook',
      detail: 'Cabeçalho X-Urion-Webhook-Secret ausente ou inválido.',
    });
    return;
  }

  const payload = (req.body as Partial<DeployWebhookPayload> | undefined) ?? {};
  const provider = payload.provider ?? 'generic';
  const environment = payload.environment ?? 'production';
  const artifacts = payload.artifacts ?? [];

  logger.info({
    event: 'DEPLOY_QUALITY_GATE_CHECKING',
    provider,
    environment,
    commitHash: payload.commitHash,
    artifactsCount: artifacts.length,
  });

  const scanner = new NoCodeArtifactScanner();
  const findings: Array<{ file: string; ruleId: string; severity: string; message: string }> = [];

  // Escaneia cada artefato enviado no payload
  for (const artifact of artifacts) {
    const scanResult = scanner.scan(artifact.content, artifact.fileName);
    if (!scanResult.isSafe) {
      for (const finding of scanResult.findings) {
        findings.push({
          file: artifact.fileName,
          ruleId: finding.ruleId,
          severity: finding.severity,
          message: finding.message,
        });
      }
    }
  }

  const passed = findings.length === 0;

  if (passed) {
    logger.info({
      event: 'DEPLOY_QUALITY_GATE_PASSED',
      provider,
      commitHash: payload.commitHash,
    });

    res.status(200).json({
      passed: true,
      status: 'APPROVED',
      message:
        'Quality Gate Aprovado. O projeto atende todos os critérios de segurança Urion Safeguard.',
      timestamp: new Date().toISOString(),
    });
  } else {
    logger.error({
      event: 'DEPLOY_QUALITY_GATE_REJECTED',
      provider,
      commitHash: payload.commitHash,
      findingsCount: findings.length,
    });

    res.status(422).json({
      passed: false,
      status: 'REJECTED',
      message:
        'Quality Gate Reprovado. Implantação bloqueada devido a riscos de segurança/qualidade.',
      timestamp: new Date().toISOString(),
      summary: {
        totalViolations: findings.length,
        findings,
      },
    });
  }
};
