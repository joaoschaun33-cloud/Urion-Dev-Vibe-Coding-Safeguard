import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

const { queryRaw, ping } = vi.hoisted(() => ({ queryRaw: vi.fn(), ping: vi.fn() }));

vi.mock('@/shared/infrastructure/database', () => ({ prisma: { $queryRaw: queryRaw } }));
vi.mock('@/shared/infrastructure/redis', () => ({ redis: { ping } }));

import { livenessCheck, readinessCheck, deepHealthCheck } from '../health-check';

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}
const req = {} as Request;

describe('health-check', () => {
  beforeEach(() => {
    queryRaw.mockReset();
    ping.mockReset();
  });

  it('liveness responde 200 sem consultar dependencias', () => {
    const res = mockRes();
    livenessCheck(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(queryRaw).not.toHaveBeenCalled();
    const body = vi.mocked(res.json).mock.calls[0][0] as { status: string };
    expect(body.status).toBe('ok');
  });

  it('readiness responde 200 quando banco e redis estao up', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    ping.mockResolvedValue('PONG');
    const res = mockRes();

    await readinessCheck(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = vi.mocked(res.json).mock.calls[0][0] as {
      status: string;
      services: { database: { status: string }; redis: { status: string } };
    };
    expect(body.status).toBe('ok');
    expect(body.services.database.status).toBe('up');
    expect(body.services.redis.status).toBe('up');
  });

  it('readiness responde 503 (degraded) quando o banco cai', async () => {
    queryRaw.mockRejectedValue(new Error('db down'));
    ping.mockResolvedValue('PONG');
    const res = mockRes();

    await readinessCheck(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    const body = vi.mocked(res.json).mock.calls[0][0] as {
      services: { database: { status: string }; redis: { status: string } };
    };
    expect(body.services.database.status).toBe('down');
    expect(body.services.redis.status).toBe('up');
  });

  it('readiness responde 503 quando o redis cai', async () => {
    queryRaw.mockResolvedValue([]);
    ping.mockRejectedValue(new Error('redis down'));
    const res = mockRes();

    await readinessCheck(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('deepHealthCheck reutiliza o readiness', () => {
    expect(deepHealthCheck).toBe(readinessCheck);
  });
});
