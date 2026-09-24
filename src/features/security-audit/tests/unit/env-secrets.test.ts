import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findEnvSecrets, isEnvFileName } from '../../domain/env-secrets';
import { ScanVibeGuardUseCase } from '../../application/scan-vibe-guard';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const cli = require(path.resolve(here, '../../../../../bin/lib/mode-maker.cjs')) as {
  findEnvSecrets: (c: string) => Array<{ line: number; key: string }>;
  isEnvFileName: (n: string) => boolean;
  scanProject: (d: string) => {
    issues: Array<{ rule: { id: string }; file: string; line: number; snippet: string }>;
  };
};

// Segredos falsos montados por concatenacao (nao disparam Gitleaks/GitHub).
const STRIPE = ['sk_', 'live_', '51Nq8ZbLkD3fA9xT7VwY2cRe'].join('');
const OPENAI = ['sk-', 'proj-', 'A1b2C3d4E5f6G7h8I9j0K1l2'].join('');
const SUPA = ['sbp_', 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4'].join('');

describe('isEnvFileName', () => {
  it.each([
    ['.env', true],
    ['.env.local', true],
    ['.env.production', true],
    ['prod.env', true],
    ['src/config/.env', true],
    ['.env.example', false],
    ['.env.sample', false],
    ['.env.template', false],
    ['.envrc', false],
    ['environment.ts', false],
  ])('%s -> %s', (name, expected) => {
    expect(isEnvFileName(name)).toBe(expected);
  });
});

describe('findEnvSecrets', () => {
  it('acha segredo sem aspas (formato normal de .env)', () => {
    const hits = findEnvSecrets(`PORT=3000\nOPENAI_API_KEY=${OPENAI}\n`);
    expect(hits).toEqual([{ line: 2, key: 'OPENAI_API_KEY' }]);
  });

  it('acha por NOME mesmo sem formato de provedor (JWT/senha/service role)', () => {
    const hits = findEnvSecrets(
      [
        'JWT_SECRET_KEY=umsegredolongodemais',
        'SUPABASE_SERVICE_ROLE_KEY=abcdefghijklmnop',
        'DB_PASSWORD=hunter2hunter2',
      ].join('\n')
    );
    expect(hits.map((h) => h.key)).toEqual([
      'JWT_SECRET_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DB_PASSWORD',
    ]);
  });

  it('acha URL de banco COM credenciais, mas nao URL sem credenciais', () => {
    expect(
      findEnvSecrets('DATABASE_URL=postgres://admin:Pa55w0rdPa55@db.internal:5432/app').map(
        (h) => h.key
      )
    ).toEqual(['DATABASE_URL']);
    expect(findEnvSecrets('DATABASE_URL=postgres://localhost:5432/app')).toEqual([]);
  });

  it('acha token de provedor mesmo em variavel publica (vai para o navegador)', () => {
    expect(findEnvSecrets(`VITE_STRIPE=${STRIPE}`).map((h) => h.key)).toEqual(['VITE_STRIPE']);
    expect(findEnvSecrets(`SB=${SUPA}`).map((h) => h.key)).toEqual(['SB']);
  });

  it('ignora variaveis publicas por prefixo ou palavra', () => {
    const env = [
      'VITE_SUPABASE_PUBLISHABLE_KEY=abcdefghijklmnopqrstuvwxyz0123456789',
      'NEXT_PUBLIC_API_KEY=abcdefghijklmnopqrstuvwxyz',
      'SUPABASE_ANON_KEY=abcdefghijklmnopqrstuvwxyz',
      'MAPBOX_PUBLIC_TOKEN=pk.abcdefghijklmnop',
    ].join('\n');
    expect(findEnvSecrets(env)).toEqual([]);
  });

  it('ignora vazio, comentario, placeholder e valor de exemplo', () => {
    const env = [
      '# API_KEY=comentado1234567890',
      'API_KEY=',
      'STRIPE_SECRET_KEY=your_secret_here',
      'JWT_SECRET=changeme',
      'DB_PASSWORD=xxxxxxxx',
      'TOKEN=<cole-aqui>',
      'API_TOKEN=exemplo1234567890',
    ].join('\n');
    expect(findEnvSecrets(env)).toEqual([]);
  });

  it('entende export, aspas, comentario na linha e CRLF', () => {
    const env = `export API_TOKEN="abcdefgh12345678"  # nao e placeholder\r\nSECRET_KEY='segredo-longo-1234'\r\n`;
    expect(findEnvSecrets(env).map((h) => h.key)).toEqual(['API_TOKEN', 'SECRET_KEY']);
  });

  it('a versao do CLI (mode-maker.cjs) da o MESMO resultado que a de dominio', () => {
    const samples = [
      `PORT=3000\nOPENAI_API_KEY=${OPENAI}\nVITE_URL=http://x\n`,
      'JWT_SECRET_KEY=umsegredolongodemais\nDATABASE_URL=postgres://a:b@h/db\nDATABASE_URL=postgres://localhost/db',
      '# c\nAPI_KEY=\nexport TOKEN="abcdefgh12345678" # x\r\n',
      `NEXT_PUBLIC_K=abcdefghijklmnop\nX=${STRIPE}\nMAPBOX_PUBLIC_TOKEN=pk.abcdefgh1234`,
      'linha sem igual\n=semchave\n1INVALID=valorvalorvalor\nOK_SECRET=valorvalorvalor',
    ];
    for (const s of samples) {
      expect(cli.findEnvSecrets(s)).toEqual(findEnvSecrets(s));
    }
    for (const n of [
      '.env',
      '.env.local',
      'a.env',
      '.env.example',
      '.envrc',
      'x.ts',
      '.env.sample',
    ]) {
      expect(cli.isEnvFileName(n)).toBe(isEnvFileName(n));
    }
  });
});

describe('scanners leem .env de verdade (CLI e use case) sem vazar o valor', () => {
  function project(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-envscan-'));
    fs.writeFileSync(
      path.join(dir, '.env'),
      `PORT=3000\nOPENAI_API_KEY=${OPENAI}\nVITE_SUPABASE_PUBLISHABLE_KEY=abcdefghijklmnopqrstuvwxyz\n`
    );
    fs.writeFileSync(path.join(dir, '.env.example'), 'OPENAI_API_KEY=troque_aqui\n');
    fs.writeFileSync(path.join(dir, '.env.local'), 'JWT_SECRET=umsegredolongodemais\n');
    return dir;
  }

  it('CLI: acusa .env e .env.local, ignora .env.example e variavel publica', () => {
    const dir = project();
    try {
      const { issues } = cli.scanProject(dir);
      const found = issues.map((i) => `${i.file}:${String(i.line)}:${i.rule.id}`).sort();
      expect(found).toEqual(['.env.local:1:SECRETS_HARDCODED', '.env:2:SECRETS_HARDCODED']);
      for (const i of issues) {
        expect(i.snippet).toMatch(/=\*\*\*$/);
        expect(i.snippet).not.toContain(OPENAI);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('use case (TS): mesmo comportamento e mesmo mascaramento', async () => {
    const dir = project();
    try {
      const report = await new ScanVibeGuardUseCase().execute(dir);
      const found = report.issues
        .map((i) => `${i.filePath}:${String(i.lineNumber)}:${i.ruleId}`)
        .sort();
      expect(found).toEqual(['.env.local:1:SECRETS_HARDCODED', '.env:2:SECRETS_HARDCODED']);
      for (const i of report.issues) {
        expect(i.snippet).toMatch(/=\*\*\*$/);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('segredo entre aspas em .env vira UM achado; chave publica entre aspas nao vira nenhum', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-envdup-'));
    try {
      fs.writeFileSync(
        path.join(dir, '.env'),
        `STRIPE_SECRET_KEY="${STRIPE}"\nVITE_COPILOT_PUBLIC_API_KEY="ck_pub_abcdefghijklmnopqrstuvwxyz"\n`
      );
      const issues = cli.scanProject(dir).issues;
      expect(issues.map((i) => `${String(i.line)}:${i.snippet}`)).toEqual([
        '1:STRIPE_SECRET_KEY=***',
      ]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
