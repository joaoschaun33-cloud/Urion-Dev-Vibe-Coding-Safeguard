import { describe, it, expect } from 'vitest';
import { handleDeployQualityGateWebhook } from '../deploy-webhook';
import { Request, Response } from 'express';

describe('handleDeployQualityGateWebhook', () => {
  it('deve aprovar o deploy quando não há artefatos inseguros', () => {
    const req = {
      headers: {},
      body: {
        provider: 'vercel',
        commitHash: 'abc1234',
        artifacts: [
          {
            fileName: 'safe-config.json',
            content: JSON.stringify({ name: 'my-app' }),
          },
        ],
      },
    } as unknown as Request;

    const res = {
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      json: function (data: unknown) {
        this.body = data;
        return this;
      },
      statusCode: 200,
      body: null,
    } as unknown as Response & { statusCode: number; body: { passed: boolean; status: string } };

    handleDeployQualityGateWebhook(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.status).toBe('APPROVED');
  });

  it('deve rejeitar o deploy (422) quando encontra um artefato inseguro', () => {
    const req = {
      headers: {},
      body: {
        provider: 'netlify',
        commitHash: 'bad5678',
        artifacts: [
          {
            fileName: 'leaked-n8n.json',
            content: JSON.stringify({
              nodes: [
                {
                  name: 'Leaky Node',
                  parameters: { Authorization: 'Bearer sk_live_mock_secret_key_12345678' },
                },
              ],
              connections: {},
            }),
          },
        ],
      },
    } as unknown as Request;

    const res = {
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      json: function (data: unknown) {
        this.body = data;
        return this;
      },
      statusCode: 200,
      body: null,
    } as unknown as Response & { statusCode: number; body: { passed: boolean; status: string } };

    handleDeployQualityGateWebhook(req, res);

    expect(res.statusCode).toBe(422);
    expect(res.body.passed).toBe(false);
    expect(res.body.status).toBe('REJECTED');
  });
});
