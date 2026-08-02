// src/mcp/tests/unit/urion-mcp-server.test.ts

import { describe, it, expect } from 'vitest';
import { UrionMcpGuardServer } from '../../urion-mcp-server';

describe('UrionMcpGuardServer', () => {
  it('deve aprovar codigo seguro', () => {
    const server = new UrionMcpGuardServer();
    const safeCode = `
      const apiKey = process.env.STRIPE_API_KEY;
      const sql = 'SELECT * FROM users WHERE id = $1';
    `;
    const result = server.checkCodeSafety(safeCode);

    expect(result.allowed).toBe(true);
    expect(result.status).toBe('APPROVED');
    expect(result.violations.length).toBe(0);
  });

  it('deve rejeitar codigo com segredo hardcoded', () => {
    const server = new UrionMcpGuardServer();
    const unsafeCode = `const aws_access_key_id = "AKIA1234567890ABCDEF";`;
    const result = server.checkCodeSafety(unsafeCode);

    expect(result.allowed).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.violations.length).toBe(1);
    expect(result.violations[0].ruleId).toBe('SECRETS_HARDCODED');
  });

  it('deve explicar o risco de uma vulnerabilidade em linguagem simples', () => {
    const server = new UrionMcpGuardServer();
    const explanation = server.explainRisk('SECRETS_HARDCODED');
    expect(explanation).toContain('Chave de API / Segredo Exposto');
    expect(explanation).toContain('Sua chave de acesso secreta');
  });
});
