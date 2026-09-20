import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { runSpecGate } from '../../tools';
import { createUrionMcpServer } from '../../server';
import { collectSpecCandidates } from '../../../features/spec-manager/infrastructure/spec-candidates-reader';

let projectDir: string;

beforeAll(() => {
  projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-spec-'));
  fs.mkdirSync(path.join(projectDir, 'docs', 'specs', 'nested'), { recursive: true });
  fs.writeFileSync(
    path.join(projectDir, 'docs', 'specs', 'checkout.md'),
    '# Checkout\n\n## Criterios de aceite\n\n- [ ] Calcula frete\n- [ ] Aplica cupom\n'
  );
  fs.writeFileSync(
    path.join(projectDir, 'docs', 'specs', 'nested', 'busca.md'),
    '# Busca\n\nsem criterios\n'
  );
  fs.writeFileSync(path.join(projectDir, 'docs', 'specs', 'ignorado.txt'), 'nao e markdown');
  fs.mkdirSync(path.join(projectDir, 'src'));
  fs.writeFileSync(
    path.join(projectDir, 'src', 'checkout.md'),
    '# fora das pastas de spec\n- [ ] x\n'
  );
});

afterAll(() => {
  fs.rmSync(projectDir, { recursive: true, force: true });
});

describe('collectSpecCandidates', () => {
  it('le so .md das pastas convencionais de spec, inclusive subpastas', () => {
    const paths = collectSpecCandidates(projectDir)
      .map((c) => c.path)
      .sort();
    expect(paths).toEqual(['docs/specs/checkout.md', 'docs/specs/nested/busca.md']);
  });

  it('retorna vazio quando o projeto nao tem pastas de spec', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-empty-'));
    try {
      expect(collectSpecCandidates(empty)).toEqual([]);
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe('runSpecGate', () => {
  it('SPEC_OK para feature com spec e criterios', () => {
    const r = runSpecGate({ feature: 'checkout', projectPath: projectDir });
    expect(r.isError).toBe(false);
    expect(r.structuredContent.status).toBe('SPEC_OK');
    expect(r.content[0].text).toContain('SPEC_OK');
  });

  it('INCOMPLETE_SPEC quando a spec nao tem criterios', () => {
    const r = runSpecGate({ feature: 'busca', projectPath: projectDir });
    expect(r.structuredContent.status).toBe('INCOMPLETE_SPEC');
  });

  it('NEEDS_SPEC para feature sem spec, mandando NAO implementar', () => {
    const r = runSpecGate({ feature: 'pagamento pix', projectPath: projectDir });
    expect(r.structuredContent.status).toBe('NEEDS_SPEC');
    expect(r.content[0].text).toContain('NAO implemente');
  });

  it('erro claro quando projectPath nao existe', () => {
    const r = runSpecGate({ feature: 'x', projectPath: path.join(projectDir, 'nao-existe') });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toContain('nao encontrada');
  });

  it('usa o diretorio atual quando projectPath e omitido', () => {
    const r = runSpecGate({ feature: 'nome-improvavel-xyz-123' });
    expect(r.structuredContent.status).toBe('NEEDS_SPEC');
  });
});

describe('urion_spec_gate via protocolo MCP (cliente <-> servidor em memoria)', () => {
  it('a tool esta listada e responde com conteudo estruturado', async () => {
    const server = createUrionMcpServer();
    const client = new Client({ name: 'teste', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const tools = await client.listTools();
    expect(tools.tools.map((t) => t.name)).toContain('urion_spec_gate');

    const res = await client.callTool({
      name: 'urion_spec_gate',
      arguments: { feature: 'checkout', projectPath: projectDir },
    });
    const structured = res.structuredContent as { status: string; spec: { criteria: number } };
    expect(structured.status).toBe('SPEC_OK');
    expect(structured.spec.criteria).toBe(2);

    await client.close();
    await server.close();
  });
});
