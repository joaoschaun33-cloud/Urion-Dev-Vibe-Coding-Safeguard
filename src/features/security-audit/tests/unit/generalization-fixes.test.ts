// Regressoes das causas de falso alarme achadas no LOTE NOVO de 80 repositorios (nunca vistos
// pelos detectores): bundle commitado, pasta oculta, chave publica do Firebase, limitador
// global, script de migracao, rota de admin, RLS dinamico. Ver benchmarks/real/RESULTS.md.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ScanVibeGuardUseCase } from '../../application/scan-vibe-guard';
import { detectMissingRls } from '../../application/detect-missing-rls';
import { detectNPlusOne } from '../../application/detect-n-plus-one';
import { detectSwallowedErrors } from '../../application/detect-swallowed-errors';
import { detectUserIdFromClient } from '../../application/detect-userid-from-client';
import {
  isDevScriptPath,
  isFirebaseWebConfigLine,
  looksGeneratedContent,
} from '../../domain/scan-filters';
import { VIBE_GUARD_RULES } from '../../domain/vibe-guard-rules';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const cli = require(path.resolve(here, '../../../../../bin/lib/mode-maker.cjs')) as {
  scanProject: (d: string) => {
    issues: Array<{ rule: { id: string }; file: string; line: number }>;
  };
};
const code = (p: string, c: string): { path: string; content: string } => ({ path: p, content: c });
const GOOGLE = ['AIza', 'SyA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6'].join('');

describe('filtros de dominio', () => {
  it('looksGeneratedContent: linha gigante ou arquivo enorme; codigo normal nao', () => {
    expect(looksGeneratedContent(`${'x'.repeat(1100)}\nfoo()`)).toBe(true);
    expect(looksGeneratedContent('a'.repeat(210 * 1024))).toBe(true);
    expect(looksGeneratedContent('const a = 1;\nconst b = 2;\n')).toBe(false);
  });

  it('isFirebaseWebConfigLine: reconhece pelo objeto vizinho, nao por qualquer apiKey', () => {
    const cfg = [
      'export const firebaseConfig = {',
      `  apiKey: "${GOOGLE}",`,
      '  authDomain: "x.firebaseapp.com",',
      '  projectId: "x",',
      '};',
    ];
    expect(isFirebaseWebConfigLine(cfg, 1)).toBe(true);
    const lone = ['const geocode = {', `  apiKey: "${GOOGLE}",`, '  region: "br",', '};'];
    expect(isFirebaseWebConfigLine(lone, 1)).toBe(false);
  });

  it('isDevScriptPath: scripts/, bin/, migrations/, seeds/', () => {
    for (const p of [
      'scripts/migrate.js',
      'server/scripts/x.js',
      'bin/cli.js',
      'db/migrations/1.js',
      'seeds/a.ts',
    ]) {
      expect(isDevScriptPath(p), p).toBe(true);
    }
    for (const p of ['src/routes/a.ts', 'src/scriptsmith/a.ts', 'src/app.ts']) {
      expect(isDevScriptPath(p), p).toBe(false);
    }
  });
});

describe('scanners do vibeguard (TS e CLI): mesmo comportamento', () => {
  function project(): string {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-gen-'));
    fs.mkdirSync(path.join(d, 'src'), { recursive: true });
    fs.mkdirSync(path.join(d, '.vite'), { recursive: true });
    // 1) bundle commitado (linha gigante) — deve ser ignorado
    fs.writeFileSync(
      path.join(d, 'a-bundle.js'),
      `${'x'.repeat(1200)}\nel.innerHTML = userInput;\n`
    );
    // 2) codigo do projeto DEPOIS do bundle — nao pode ser pulado junto
    fs.writeFileSync(path.join(d, 'src', 'b.js'), 'el.innerHTML = userInput;\n');
    // 3) pasta oculta (cache do Vite)
    fs.writeFileSync(path.join(d, '.vite', 'c.js'), 'el.innerHTML = hidden;\n');
    // 4) chave publica do Firebase Web — nao e segredo
    fs.writeFileSync(
      path.join(d, 'src', 'fb.ts'),
      `export const c = {\n  apiKey: "${GOOGLE}",\n  authDomain: "x.firebaseapp.com",\n};\n`
    );
    // 5) chave que NAO e de Firebase — e segredo
    fs.writeFileSync(path.join(d, 'src', 'geo.ts'), `const GEOCODE_API_KEY = "${GOOGLE}";\n`);
    return d;
  }

  it('ignora bundle, pasta oculta e chave publica do Firebase; segue escaneando o resto', async () => {
    const d = project();
    try {
      const fromCli = cli
        .scanProject(d)
        .issues.map((i) => `${i.file}:${String(i.line)}:${i.rule.id}`)
        .sort();
      const report = await new ScanVibeGuardUseCase().execute(d);
      const fromTs = report.issues
        .map((i) => `${i.filePath}:${String(i.lineNumber)}:${i.ruleId}`)
        .sort();
      expect(fromCli).toEqual(['src/b.js:1:XSS_UNSANITIZED', 'src/geo.ts:1:SECRETS_HARDCODED']);
      expect(fromTs).toEqual(fromCli);
    } finally {
      fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it('limitador global (app.use(limiter)) suprime RATE_LIMIT_MISSING; sem ele, acusa', async () => {
    const withLimiter = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-rl-'));
    const without = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-rl2-'));
    try {
      const route = "router.post('/login', async (req, res) => { res.json({}); });\n";
      fs.writeFileSync(path.join(withLimiter, 'auth.js'), route);
      fs.writeFileSync(path.join(withLimiter, 'server.js'), "app.use('/api', limiter);\n");
      fs.writeFileSync(path.join(without, 'auth.js'), route);
      for (const [dir, expected] of [
        [withLimiter, 0],
        [without, 1],
      ] as const) {
        const cliN = cli
          .scanProject(dir)
          .issues.filter((i) => i.rule.id === 'RATE_LIMIT_MISSING').length;
        const tsN = (await new ScanVibeGuardUseCase().execute(dir)).issues.filter(
          (i) => i.ruleId === 'RATE_LIMIT_MISSING'
        ).length;
        expect([cliN, tsN]).toEqual([expected, expected]);
      }
    } finally {
      fs.rmSync(withLimiter, { recursive: true, force: true });
      fs.rmSync(without, { recursive: true, force: true });
    }
  });
});

describe('XSS: falsos alarmes do lote novo', () => {
  const xss = VIBE_GUARD_RULES.find((r) => r.id === 'XSS_UNSANITIZED')?.regex as RegExp;

  it.each(['modalTitle.innerHTML = title.innerHTML;', 'if (v) sel.innerHTML = item.innerHTML;'])(
    'nao acusa copia DOM->DOM: %s',
    (line) => {
      expect(xss.test(line)).toBe(false);
    }
  );

  it.each([
    'item.innerHTML = `<b>${name}</b>`;',
    'el.innerHTML = a.innerHTML + evil;',
    'el.innerHTML = `<b>` + name;',
    'printWindow.document.write(`<h1>${name}</h1>`);',
    'style.innerHTML = `', // template aberto: o regex por linha dispara; o scanner decide pelo corpo
  ])('continua acusando: %s', (line) => {
    expect(xss.test(line)).toBe(true);
  });

  it('scanners (TS e CLI): template de varias linhas SEM ${} e estatico; COM ${dado} e acusado', async () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-tpl-'));
    try {
      fs.writeFileSync(
        path.join(d, 'static.js'),
        'gtm.innerHTML = `\n  <iframe src="https://x/ns.html"></iframe>\n`;\n'
      );
      fs.writeFileSync(
        path.join(d, 'dynamic.js'),
        'w.document.write(`\n  <h1>Relatorio</h1>\n  <p>${customer.name}</p>\n`);\n'
      );
      const fromCli = cli
        .scanProject(d)
        .issues.map((i) => `${i.file}:${String(i.line)}`)
        .sort();
      const fromTs = (await new ScanVibeGuardUseCase().execute(d)).issues
        .map((i) => `${i.filePath}:${String(i.lineNumber)}`)
        .sort();
      expect(fromCli).toEqual(['dynamic.js:1']);
      expect(fromTs).toEqual(fromCli);
    } finally {
      fs.rmSync(d, { recursive: true, force: true });
    }
  });

  it('arquivo "gerado" (linha longa) ainda acusa SEGREDO, mas nao XSS', async () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'urion-gensec-'));
    try {
      const token = ['sbp_', 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4'].join('');
      // script escrito a mao com SQL embutido numa linha enorme + um token de verdade
      fs.writeFileSync(
        path.join(d, 'deploy.js'),
        `const ACCESS_TOKEN = '${token}';\nconst SQL = '${'x'.repeat(1200)}';\nel.innerHTML = userInput;\n`
      );
      const fromCli = cli.scanProject(d).issues.map((i) => i.rule.id);
      const fromTs = (await new ScanVibeGuardUseCase().execute(d)).issues.map((i) => i.ruleId);
      expect(fromCli).toEqual(['SECRETS_HARDCODED']);
      expect(fromTs).toEqual(fromCli);
    } finally {
      fs.rmSync(d, { recursive: true, force: true });
    }
  });
});

describe('config gate: falsos alarmes do lote novo', () => {
  it('N+1: script de migracao e query de escrita/transacao nao sao N+1 de leitura', () => {
    const loop =
      "for (const f of files) {\n  await client.query('BEGIN');\n  await client.query('INSERT INTO m (n) VALUES ($1)', [f]);\n  await client.query('COMMIT');\n}\n";
    expect(detectNPlusOne([code('src/db.ts', loop)])).toHaveLength(0);
    expect(
      detectNPlusOne([
        code(
          'server/scripts/migrate.js',
          "for (const f of fs) {\n  await db.query('SELECT 1 FROM t WHERE id = $1', [f]);\n}\n"
        ),
      ])
    ).toHaveLength(0);
    expect(
      detectNPlusOne([
        code(
          'src/repo.ts',
          "for (const id of ids) {\n  await db.query('SELECT * FROM users WHERE id = $1', [id]);\n}\n"
        ),
      ])
    ).toHaveLength(1);
  });

  it('USERID_FROM_CLIENT: rota de admin (adminAuth) nao e acusada; rota comum continua', () => {
    const admin =
      "router.post('/deposits/credit', adminAuth, async (req, res) => {\n  const { userId, amount } = req.body;\n});\n";
    const plain =
      "router.post('/orders', async (req, res) => {\n  const { userId, total } = req.body;\n});\n";
    expect(detectUserIdFromClient([code('r.js', admin)])).toHaveLength(0);
    expect(detectUserIdFromClient([code('r.js', plain)])).toHaveLength(1);
  });

  it('RLS: "create table as" nao e tabela; RLS por SQL dinamico (EXECUTE format) nao e acusado', () => {
    expect(
      detectMissingRls([{ path: 'a.sql', content: 'create table as select 1;' }])
    ).toHaveLength(0);
    const dynamic =
      "create table public.a (id int);\nDO $$ BEGIN EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', 'a'); END $$;";
    expect(detectMissingRls([{ path: 'a.sql', content: dynamic }])).toHaveLength(0);
  });

  it('ERROR_SWALLOWED: script avulso, share/analytics/logout/parse de resposta nao sao acusados', () => {
    const s = (p: string, c: string): number => detectSwallowedErrors([code(p, c)]).length;
    expect(s('frontend/scripts/check.mjs', 'try { x(); } catch (e) {}')).toBe(0);
    expect(s('src/a.tsx', 'try { await navigator.share({ url }); } catch {}')).toBe(0);
    expect(s('src/a.tsx', 'try { window.gtag("event", "x"); } catch {}')).toBe(0);
    expect(s('src/a.ts', 'await fetch("/logout", { method: "POST" }).catch(() => {});')).toBe(0);
    expect(s('src/a.ts', 'try { body = await res.json(); } catch {}')).toBe(0);
    expect(s('src/a.ts', 'try { await db.orders.insert(o); } catch {}')).toBe(1);
  });
});

describe('ERROR_SWALLOWED: .json() so e inofensivo dentro de try/catch', () => {
  it('cadeia de promise fetch().then(r => r.json()).catch(() => {}) continua sendo achado', () => {
    const chain =
      "fetch('/api/x')\n  .then((r) => r.json())\n  .then(setData)\n  .catch(() => {});";
    expect(detectSwallowedErrors([{ path: 'src/a.tsx', content: chain }])).toHaveLength(1);
    const tryParse = 'try { body = await res.json(); } catch {}';
    expect(detectSwallowedErrors([{ path: 'src/a.ts', content: tryParse }])).toHaveLength(0);
  });
});
