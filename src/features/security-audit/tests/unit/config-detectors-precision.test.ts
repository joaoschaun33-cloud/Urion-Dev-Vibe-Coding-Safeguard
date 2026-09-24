// Regressoes de PRECISAO do config gate, uma por causa de falso alarme medida em 81
// repositorios reais (benchmarks/real/RESULTS.md). Cada teste trava um caso real.
import { describe, it, expect } from 'vitest';
import { detectMissingRls, looksLikeSupabaseProject } from '../../application/detect-missing-rls';
import { detectEnvLeaks, isIgnoredByGitignores } from '../../application/detect-env-leaks';
import { detectUnprotectedRoutes } from '../../application/detect-unprotected-routes';
import { detectSwallowedErrors } from '../../application/detect-swallowed-errors';

const sql = (path: string, content: string): { path: string; content: string } => ({
  path,
  content,
});
const code = (path: string, content: string): { path: string; content: string } => ({
  path,
  content,
});

describe('RLS_MISSING', () => {
  it('RLS ativado em OUTRA migracao do mesmo projeto vale para a tabela', () => {
    const f = detectMissingRls([
      sql('supabase/migrations/1_tables.sql', 'create table public.tasks (id int);'),
      sql('supabase/migrations/2_rls.sql', 'alter table public.tasks enable row level security;'),
    ]);
    expect(f).toHaveLength(0);
  });

  it('acusa quando nenhum SQL do projeto ativa o RLS da tabela', () => {
    const f = detectMissingRls([
      sql(
        'supabase/migrations/1.sql',
        'create table public.a (id int);\ncreate table public.b (id int);'
      ),
      sql('supabase/migrations/2.sql', 'alter table public.a enable row level security;'),
    ]);
    expect(f.map((x) => x.message)).toEqual([expect.stringContaining('"b"')]);
  });

  it('entende ALTER TABLE ONLY, FORCE e nome entre aspas', () => {
    const f = detectMissingRls([
      sql('a.sql', 'CREATE TABLE "public"."orders" (id int);\nCREATE TABLE public.notes (id int);'),
      sql(
        'b.sql',
        'ALTER TABLE ONLY "public"."orders" ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.notes FORCE ROW LEVEL SECURITY;'
      ),
    ]);
    expect(f).toHaveLength(0);
  });

  it('nao acusa tabela em schema nao-public (nao exposto pela API)', () => {
    expect(detectMissingRls([sql('a.sql', 'create table private.audit (id int);')])).toHaveLength(
      0
    );
  });

  it('nao acusa quando o projeto NAO e Supabase (supabaseProject:false)', () => {
    expect(
      detectMissingRls([sql('a.sql', 'create table users (id int);')], { supabaseProject: false })
    ).toHaveLength(0);
  });

  it('sem informacao de contexto mantem o comportamento legado (acusa)', () => {
    expect(detectMissingRls([sql('a.sql', 'create table users (id int);')])).toHaveLength(1);
  });

  it('looksLikeSupabaseProject: pasta, dependencia ou auth.uid() no SQL', () => {
    const none = {
      manifests: ['{"dependencies":{"express":"4"}}'],
      hasSupabaseDir: false,
      sqlFiles: [sql('db/a.sql', 'create table t (id int);')],
    };
    expect(looksLikeSupabaseProject(none)).toBe(false);
    expect(looksLikeSupabaseProject({ ...none, hasSupabaseDir: true })).toBe(true);
    expect(
      looksLikeSupabaseProject({
        ...none,
        manifests: ['{"dependencies":{"@supabase/supabase-js":"2"}}'],
      })
    ).toBe(true);
    expect(
      looksLikeSupabaseProject({
        ...none,
        sqlFiles: [sql('db/a.sql', 'using (auth.uid() = owner)')],
      })
    ).toBe(true);
    expect(
      looksLikeSupabaseProject({
        ...none,
        sqlFiles: [sql('supabase/migrations/a.sql', 'select 1')],
      })
    ).toBe(true);
  });
});

describe('ENV_NOT_IGNORED', () => {
  const SECRET = 'JWT_SECRET=umsegredolongodemais12345';

  it('so acusa .env que contem segredo; variaveis publicas (VITE_*) nao vazam nada', () => {
    const f = detectEnvLeaks({
      gitignore: '',
      envFiles: ['.env', 'apps/web/.env'],
      contents: {
        '.env': SECRET,
        'apps/web/.env': 'VITE_SUPABASE_PUBLISHABLE_KEY=abcdefghijklmnopqrstuvwxyz',
      },
    });
    expect(f.map((x) => x.file)).toEqual(['.env']);
    expect(f[0].message).toContain('JWT_SECRET');
    expect(f[0].message).not.toContain('umsegredolongodemais');
  });

  it('".env" no .gitignore NAO cobre ".env.production" (o Git so ignora o nome exato)', () => {
    const f = detectEnvLeaks({
      gitignore: '.env\nnode_modules\n',
      envFiles: ['.env', '.env.production'],
      contents: { '.env': SECRET, '.env.production': SECRET },
    });
    expect(f.map((x) => x.file)).toEqual(['.env.production']);
  });

  it('".env*" e ".env.*" cobrem as variantes; "!.env.example" nao reativa segredo', () => {
    expect(
      detectEnvLeaks({
        gitignore: '.env*\n',
        envFiles: ['.env', '.env.local'],
        contents: { '.env': SECRET, '.env.local': SECRET },
      })
    ).toHaveLength(0);
    expect(
      detectEnvLeaks({
        gitignore: '.env\n.env.*\n!.env.example\n',
        envFiles: ['.env', '.env.production'],
        contents: { '.env': SECRET, '.env.production': SECRET },
      })
    ).toHaveLength(0);
  });

  it('.gitignore de subpasta cobre o .env dela (monorepo)', () => {
    const f = detectEnvLeaks({
      gitignore: '',
      gitignores: { 'apps/api': '.env\n' },
      envFiles: ['apps/api/.env'],
      contents: { 'apps/api/.env': SECRET },
    });
    expect(f).toHaveLength(0);
  });

  it('sem conteudo disponivel mantem o comportamento legado (acusa o arquivo)', () => {
    expect(detectEnvLeaks({ gitignore: 'node_modules\n', envFiles: ['.env'] })).toHaveLength(1);
  });

  it('isIgnoredByGitignores: negacao, ancoragem por barra e diretorio', () => {
    const g = { '': '/secrets/\n*.local\n!keep.local\nconfig/.env\n' };
    expect(isIgnoredByGitignores('secrets/a.txt', g)).toBe(true);
    expect(isIgnoredByGitignores('x/secrets/a.txt', g)).toBe(false); // "/secrets/" e ancorado na raiz
    expect(isIgnoredByGitignores('a.local', g)).toBe(true);
    expect(isIgnoredByGitignores('keep.local', g)).toBe(false);
    expect(isIgnoredByGitignores('config/.env', g)).toBe(true);
    expect(isIgnoredByGitignores('other/config/.env', g)).toBe(false);
  });
});

describe('ROUTE_NO_AUTH', () => {
  it("reconhece o middleware 'protect'", () => {
    expect(
      detectUnprotectedRoutes([
        code('r.js', 'router.get("/profile/:email", protect, getUserProfile);'),
      ])
    ).toHaveLength(0);
  });

  it('router.use(auth) antes das rotas protege as rotas do arquivo', () => {
    const f = detectUnprotectedRoutes([
      code('r.ts', "router.use(requireAuth);\nrouter.get('/users', h);"),
    ]);
    expect(f).toHaveLength(0);
  });

  it("app.use('/api', auth) protege so o prefixo /api", () => {
    const f = detectUnprotectedRoutes([
      code(
        's.ts',
        "app.use('/api', authenticate);\napp.get('/api/orders', h);\napp.get('/admin/panel', h);"
      ),
    ]);
    expect(f.map((x) => x.message)).toEqual([expect.stringContaining('/admin/panel')]);
  });

  it('auth montada em OUTRO arquivo (app.use(path, authMiddleware, route)) protege o router importado', () => {
    const server = code(
      'src/server.ts',
      "import collegeRoutes from './routes/colleges';\nroutes.forEach(([path, route]) => app.use(path, authMiddleware, route));"
    );
    const routes = code(
      'src/routes/colleges.ts',
      "router.get('/profile', async (req, res) => { res.json(req.userId); });"
    );
    expect(detectUnprotectedRoutes([server, routes])).toHaveLength(0);
    // sem a montagem protegida, a mesma rota e acusada
    expect(detectUnprotectedRoutes([routes])).toHaveLength(1);
  });

  it("limitador de tentativas ('authLimiter') NAO conta como autenticacao", () => {
    const server = code(
      'src/server.ts',
      "import users from './routes/users';\napp.use('/api/users', authLimiter, users);"
    );
    const routes = code('src/routes/users.ts', "router.get('/users/:id', h);");
    expect(detectUnprotectedRoutes([server, routes])).toHaveLength(1);
    expect(
      detectUnprotectedRoutes([code('r.ts', "router.use(authLimiter);\nrouter.get('/users', h);")])
    ).toHaveLength(1);
  });

  it('rotas publicas por natureza (login, registro, callback) nao sao acusadas', () => {
    const f = detectUnprotectedRoutes([
      code(
        'r.ts',
        'app.post("/api/admin/login", h);\napp.post("/api/users/register", h);\napp.get("/api/accounts/callback", h);'
      ),
    ]);
    expect(f).toHaveLength(0);
  });
});

describe('ERROR_SWALLOWED', () => {
  const one = (src: string): number => detectSwallowedErrors([code('a.ts', src)]).length;

  it('continua acusando catch vazio em operacao que importa', () => {
    expect(one('try { await gateway.charge(); } catch (e) {}')).toBe(1);
    expect(one('await supabase.from("x").insert(row).catch(() => {});')).toBe(1);
  });

  it('nao acusa limpeza/rotina inofensiva (unsubscribe, play, localStorage, JSON.parse)', () => {
    expect(one('try { unsubApps(); } catch {}')).toBe(0);
    expect(one('video.play().catch(() => {});')).toBe(0);
    expect(one('try { localStorage.setItem(k, v); } catch {}')).toBe(0);
    expect(one('try { prefs = JSON.parse(raw); } catch (e) {}')).toBe(0);
    expect(one('await supabase.auth.signOut().catch(() => {});')).toBe(0);
    expect(one('document.fonts?.ready.then(refresh).catch(() => {});')).toBe(0);
  });

  it('olha o corpo do try em varias linhas (nao so a linha do catch)', () => {
    expect(
      one(
        'try {\n  const raw = localStorage.getItem(k);\n  prefs = JSON.parse(raw);\n} catch (e) {}'
      )
    ).toBe(0);
    expect(one('try {\n  await db.orders.insert(o);\n  await mail.send(o);\n} catch (e) {}')).toBe(
      1
    );
  });

  it('ignora arquivo minificado/ofuscado (linha gigante)', () => {
    const minified = `${'x'.repeat(900)};try{a()}catch(e){}`;
    expect(one(minified)).toBe(0);
  });
});
