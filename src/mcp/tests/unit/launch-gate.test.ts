import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { runLaunchGate, readLatestAudit } from '../../launch-gate-runner';
import { runLaunchGateTool, formatLaunchGate } from '../../launch-tool';
import { createUrionMcpServer } from '../../server';
import { runConfigGate } from '../../../features/security-audit/presentation/run-config-gate';

const dirs: string[] = [];
const daysAgo = (n: number): string => new Date(Date.now() - n * 86_400_000).toISOString();

function audit(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    reviewer: 'auditor-agent',
    model: 'modelo-b',
    authorModel: 'modelo-a',
    contextIsolation: 'fresh',
    reviewedAt: daysAgo(1),
    scope: 'PR #1',
    verdict: 'APPROVED',
    findings: [],
    ...over,
  };
}

interface Fixture {
  spec?: string;
  coveragePct?: number;
  audits?: Record<string, unknown>;
  files?: Record<string, string>;
}

function makeProject(f: Fixture): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-launch-'));
  dirs.push(root);
  const write = (rel: string, content: string): void => {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };
  if (f.spec !== undefined) {
    write('docs/specs/login.md', f.spec);
  }
  if (f.coveragePct !== undefined) {
    write(
      'coverage/coverage-summary.json',
      JSON.stringify({ total: { lines: { pct: f.coveragePct } } })
    );
  }
  for (const [name, content] of Object.entries(f.audits ?? {})) {
    write(`.urion/audit/${name}`, typeof content === 'string' ? content : JSON.stringify(content));
  }
  for (const [rel, content] of Object.entries(f.files ?? {})) {
    write(rel, content);
  }
  return root;
}

afterEach(() => {
  while (dirs.length > 0) {
    const d = dirs.pop();
    if (d) {
      fs.rmSync(d, { recursive: true, force: true });
    }
  }
});

const doneSpec = '# Login\n\n## Criterios de aceite\n\n- [x] a\n- [x] b\n';

describe('runLaunchGate (roadmap 3.4, coleta real de fatos)', () => {
  it('Grade A quando spec, cobertura real, seguranca e auditoria estao OK', async () => {
    const root = makeProject({
      spec: doneSpec,
      coveragePct: 91,
      audits: { 'audit-1.json': audit() },
      files: { 'src/app.ts': 'export const ok = 1;\n' },
    });
    const { result, auditFile } = await runLaunchGate(root);
    expect(result.grade).toBe('A');
    expect(auditFile).toBe('audit-1.json');
    expect(formatLaunchGate(result, auditFile)).toContain('GRADE A');
  });

  it('projeto vazio: NOT_READY (spec, testes e revisao bloqueiam; seguranca passa)', async () => {
    const root = makeProject({});
    const { result, auditFile } = await runLaunchGate(root);
    expect(result.grade).toBe('NOT_READY');
    expect(result.blockers).toHaveLength(3);
    expect(result.checks.find((c) => c.id === 'SECURITY')?.passed).toBe(true);
    expect(auditFile).toBeNull();
  });

  it('a auditoria MAIS RECENTE vence: REJECTED novo anula APPROVED antigo', async () => {
    const root = makeProject({
      spec: doneSpec,
      coveragePct: 90,
      audits: {
        'old.json': audit({ reviewedAt: daysAgo(5) }),
        'new.json': audit({ reviewedAt: daysAgo(1), verdict: 'REJECTED' }),
      },
    });
    const { result, auditFile } = await runLaunchGate(root);
    expect(auditFile).toBe('new.json');
    expect(result.checks.find((c) => c.id === 'REVIEW')?.passed).toBe(false);
    expect(result.ready).toBe(false);
  });

  it('relatorio com JSON invalido bloqueia o launch com motivo claro', async () => {
    const root = makeProject({
      spec: doneSpec,
      coveragePct: 90,
      audits: { 'broken.json': '{ nao e json' },
    });
    const { result } = await runLaunchGate(root);
    expect(result.checks.find((c) => c.id === 'REVIEW')?.detail).toContain('JSON invalido');
  });

  it('achado critico de seguranca bloqueia (segredo hardcoded)', async () => {
    const key = 'aws_access_' + 'key_id';
    const root = makeProject({
      spec: doneSpec,
      coveragePct: 90,
      audits: { 'a.json': audit() },
      files: { 'src/leak.ts': `const ${key} = "AKIA1234567890ABCDEF";\n` },
    });
    const { result } = await runLaunchGate(root);
    expect(result.checks.find((c) => c.id === 'SECURITY')?.passed).toBe(false);
    expect(result.ready).toBe(false);
  });

  it('cobertura abaixo de 80% ou ausente bloqueia', async () => {
    const low = await runLaunchGate(
      makeProject({ spec: doneSpec, coveragePct: 70, audits: { 'a.json': audit() } })
    );
    expect(low.result.checks.find((c) => c.id === 'TESTS')?.detail).toContain('70%');
    const none = await runLaunchGate(
      makeProject({ spec: doneSpec, audits: { 'a.json': audit() } })
    );
    expect(none.result.checks.find((c) => c.id === 'TESTS')?.detail).toContain('nao medida');
  });

  it('spec com criterios em aberto bloqueia', async () => {
    const root = makeProject({
      spec: '# Login\n\n- [x] a\n- [ ] b\n',
      coveragePct: 90,
      audits: { 'a.json': audit() },
    });
    const { result } = await runLaunchGate(root);
    expect(result.checks.find((c) => c.id === 'SPEC')?.detail).toContain('1/2');
  });

  it('ignora docs/00-context/feature-spec.md (template generico, nunca uma spec real)', async () => {
    const root = makeProject({
      spec: doneSpec,
      coveragePct: 90,
      audits: { 'a.json': audit() },
      files: {
        'docs/00-context/feature-spec.md':
          '# Feature Spec Template\n\n### Requisitos\n\n- [ ] Critério de aceite 1\n',
      },
    });
    const { result } = await runLaunchGate(root);
    expect(result.checks.find((c) => c.id === 'SPEC')?.passed).toBe(true);
  });
});

describe('readLatestAudit', () => {
  it('retorna null quando nao existe .urion/audit', () => {
    expect(readLatestAudit(makeProject({}))).toBeNull();
  });
});

describe('runConfigGate', () => {
  it('reporta achados e pontuacao de um projeto real em disco', () => {
    const root = makeProject({
      files: {
        '.env': 'X=1\n',
        '.gitignore': 'node_modules\n',
        'src/svc.ts':
          'for (const id of ids) {\n  await prisma.user.findUnique({ where: { id } });\n}\n',
      },
    });
    const r = runConfigGate(root);
    const rules = r.findings.map((f) => f.ruleId).sort();
    expect(rules).toEqual(['ENV_NOT_IGNORED', 'N_PLUS_ONE']);
    expect(r.criticalCount).toBe(1);
    expect(r.score).toBe(75);
  });

  it('ignora node_modules, arquivos de teste e bundles gigantes', () => {
    const bad = 'try { x(); } catch (e) {}\n';
    const root = makeProject({
      files: {
        'node_modules/pkg/index.js': bad,
        'src/a.test.ts': bad,
        'dist/out.js': bad,
        'src/bundle.js': bad + 'x'.repeat(210 * 1024),
        'src/ok.ts': 'export const a = 1;\n',
      },
    });
    expect(runConfigGate(root).findings).toEqual([]);
  });
});

describe('urion_launch_gate via protocolo MCP', () => {
  it('a tool esta listada e devolve grade estruturado', async () => {
    const root = makeProject({
      spec: doneSpec,
      coveragePct: 88,
      audits: { 'a.json': audit() },
    });
    const server = createUrionMcpServer();
    const client = new Client({ name: 'teste', version: '1.0.0' });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(st), client.connect(ct)]);

    expect((await client.listTools()).tools.map((t) => t.name)).toContain('urion_launch_gate');
    const res = await client.callTool({
      name: 'urion_launch_gate',
      arguments: { projectPath: root },
    });
    const structured = res.structuredContent as { grade: string; blockers: string[] };
    expect(structured.grade).toBe('A');
    expect(structured.blockers).toEqual([]);

    await client.close();
    await server.close();
  });

  it('runLaunchGateTool usa o diretorio atual quando projectPath e omitido', async () => {
    const r = await runLaunchGateTool({});
    expect(r.isError).toBe(false);
    expect(['A', 'NOT_READY']).toContain(r.structuredContent.grade);
  }, 60_000);
});
