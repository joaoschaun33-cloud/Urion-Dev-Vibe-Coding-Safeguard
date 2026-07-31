import { describe, it, expect } from 'vitest';
import { NoCodeArtifactScanner } from '../no-code-scanner';

describe('NoCodeArtifactScanner', () => {
  const scanner = new NoCodeArtifactScanner();

  it('deve detectar chaves API hardcoded em fluxos do n8n', () => {
    const n8nWorkflow = JSON.stringify({
      nodes: [
        {
          name: 'HTTP Request Node',
          type: 'n8n-nodes-base.httpRequest',
          parameters: {
            url: 'https://api.stripe.com/v1/charges',
            headers: {
              Authorization: 'Bearer mock_stripe_secret_key_1234567890123456',
            },
          },
        },
      ],
      connections: {},
    });

    const result = scanner.scan(n8nWorkflow, 'stripe-workflow.json');

    expect(result.isSafe).toBe(false);
    expect(result.criticalCount).toBeGreaterThan(0);
    expect(result.findings[0].ruleId).toBe('N8N_HARDCODED_SECRET');
    expect(result.findings[0].location).toContain('HTTP Request Node');
  });

  it('deve detectar endpoints desprotegidos em OpenAPI Specs em YAML', () => {
    const openApiYaml = `
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: OK
`;

    const result = scanner.scan(openApiYaml, 'openapi.yaml');

    expect(result.isSafe).toBe(false);
    expect(result.highCount).toBeGreaterThan(0);
    expect(result.findings.some((f) => f.ruleId === 'OPENAPI_UNPROTECTED_ENDPOINT')).toBe(true);
  });

  it('deve aprovar workflows e configs sem vazamento de segredos', () => {
    const safeConfig = JSON.stringify({
      nodes: [
        {
          name: 'Safe Webhook',
          parameters: {
            url: 'https://hooks.slack.com/services/ENV_VAR',
          },
        },
      ],
      connections: {},
    });

    const result = scanner.scan(safeConfig, 'safe-workflow.json');

    expect(result.isSafe).toBe(true);
    expect(result.totalFindings).toBe(0);
  });
});
