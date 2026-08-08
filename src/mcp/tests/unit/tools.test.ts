// src/mcp/tests/unit/tools.test.ts
import { describe, it, expect } from 'vitest';
import { runSecurityCheck, runExplainRisk } from '../../tools';
import { createUrionMcpServer } from '../../server';

describe('runSecurityCheck', () => {
  it('aprova codigo seguro (APPROVED, score 100, sem findings)', () => {
    const r = runSecurityCheck({ code: 'const apiKey = process.env.STRIPE_API_KEY;' });
    expect(r.isError).toBe(false);
    expect(r.structuredContent.status).toBe('APPROVED');
    expect(r.structuredContent.score).toBe(100);
    expect(r.structuredContent.findings).toHaveLength(0);
    expect(r.content[0].text).toContain('APPROVED');
  });

  it('rejeita secret hardcoded (REJECTED + finding CRITICAL + score<100)', () => {
    const key = 'aws_access_' + 'key_id';
    const r = runSecurityCheck({ code: `const ${key} = "AKIA1234567890ABCDEF";` });
    expect(r.structuredContent.status).toBe('REJECTED');
    expect(r.structuredContent.findings[0].ruleId).toBe('SECRETS_HARDCODED');
    expect(r.structuredContent.findings[0].severity).toBe('CRITICAL');
    expect(r.structuredContent.score).toBeLessThan(100);
    expect(r.structuredContent.remediations.length).toBeGreaterThan(0);
    expect(r.content[0].text).toContain('REJECTED');
  });

  it('trata string vazia como APPROVED', () => {
    const r = runSecurityCheck({ code: '' });
    expect(r.structuredContent.status).toBe('APPROVED');
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
