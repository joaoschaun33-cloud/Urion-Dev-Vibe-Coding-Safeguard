// src/features/security-audit/application/detect-unverified-webhook.ts
// Detector PURO: rota de webhook de pagamento sem verificacao de assinatura
// aparente (R9). Sem essa verificacao, qualquer pessoa pode forjar uma
// notificacao (ex.: "pagamento aprovado") so conhecendo a URL do endpoint.

import { type Finding } from '../domain/findings';

const ROUTE_RE = /\b(?:app|router)\.(?:get|post|put|patch)\(\s*[`'"]([^`'"]+)[`'"]/i;
const WEBHOOK_PATH_RE = /webhook/i;
const PAYMENT_HINT_RE = /(stripe|paypal|payment|pagamento|checkout|billing|mercadopago|pagseguro)/i;
const SIGNATURE_HINT_RE =
  /(constructevent|verifysignature|verify_signature|verifywebhooksignature|stripe-signature|x-signature|x-hub-signature|webhooksecret|verifywebhook)/i;

export function detectUnverifiedWebhook(
  files: Array<{ path: string; content: string }>
): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!/\.(?:m|c)?[jt]sx?$/.test(file.path)) {
      continue;
    }
    const lines = file.content.split('\n');
    lines.forEach((line, i) => {
      const m = ROUTE_RE.exec(line);
      if (!m) {
        return;
      }
      const routePath = m[1];
      const isWebhook = WEBHOOK_PATH_RE.test(routePath) && PAYMENT_HINT_RE.test(routePath);
      if (!isWebhook) {
        return;
      }
      // Janela de contexto: a rota + as proximas ~15 linhas do handler.
      const context = lines.slice(i, i + 15).join('\n');
      if (SIGNATURE_HINT_RE.test(context)) {
        return;
      }
      findings.push({
        ruleId: 'WEBHOOK_UNVERIFIED',
        severity: 'CRITICAL',
        file: file.path,
        line: i + 1,
        message: `Rota de webhook de pagamento "${routePath}" sem verificacao de assinatura aparente.`,
        remediation:
          'Valide a assinatura do webhook antes de confiar no payload (ex.: stripe.webhooks.constructEvent com o segredo do endpoint) — sem isso, qualquer um pode forjar um pagamento aprovado.',
      });
    });
  }

  return findings;
}
