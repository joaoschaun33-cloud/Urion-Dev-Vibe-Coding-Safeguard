// src/mcp/tests/unit/tools.test.ts
import { describe, it, expect } from 'vitest';
import { runSecurityCheck, runExplainRisk } from '../../tools';
import { createUrionMcpServer } from '../../server';

describe('runSecurityCheck', () => {
  it('aprova codigo seguro (APPROVED, sem violacoes)', () => {
    const r = runSecurityCheck({ code: 'const apiKey = process.env.STRIPE_API_KEY;' });
    const sc = r.structuredContent as { status: string; violations: unknown[] };
    expect(r.isError).toBe(false);
    expect(sc.status).toBe('APPROVED');
    expect(sc.violations).toHaveLength(0);
    expect(r.content[0].text).toContain('APPROVED');
  });

  it('rejeita secret hardcoded (REJECTED + SECRETS_HARDCODED)', () => {
    const key = 'aws_access_' + 'key_id';
    const r = runSecurityCheck({ code: `const ${key} = "AKIA1234567890ABCDEF";` });
    const sc = r.structuredContent as { status: string; violations: Array<{ ruleId: string }> };
    expect(sc.status).toBe('REJECTED');
    expect(sc.violations[0].ruleId).toBe('SECRETS_HARDCODED');
    expect(r.content[0].text).toContain('REJECTED');
  });

  it('trata string vazia como APPROVED', () => {
    const r = runSecurityCheck({ code: '' });
    const sc = r.structuredContent as { status: string };
    expect(sc.status).toBe('APPROVED');
  });
});

describe('runExplainRisk', () => {
  it('explica uma regra valida', () => {
    const r = runExplainRisk({ ruleId: 'SECRETS_HARDCODED' });
    expect(r.isError).toBe(false);
    expect(r.content[0].text).toContain('Chave de API / Segredo Exposto');
  });

  it('retorna isError para ruleId desconhecido (sem inventar)', () => {
    const r = runExplainRisk({ ruleId: 'NAO_EXISTE' });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toContain('nao encontrada');
  });
});

describe('createUrionMcpServer', () => {
  it('constroi o servidor MCP sem lancar excecao', () => {
    expect(() => createUrionMcpServer()).not.toThrow();
  });
});
