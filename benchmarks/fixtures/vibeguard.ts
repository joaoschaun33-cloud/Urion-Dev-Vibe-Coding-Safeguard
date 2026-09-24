// Corpus SINTETICO das 5 regras do `vibeguard`. Escrito a partir de padroes reais de
// apps gerados por IA (Express, Next.js, Supabase, Prisma, React), NAO a partir dos
// regex — casos que as regras atuais nao pegam entram de proposito (medem recall).
// Segredos falsos sao montados por concatenacao para nao disparar Gitleaks/GitHub.
import type { BenchCase } from '../lib/types';

const L = (...lines: string[]): string => lines.join('\n');
const cat = (...parts: string[]): string => parts.join('');

const STRIPE_LIVE = cat('sk_', 'live_', '51Nq8ZbLkD3fA9xT7VwY2cRe');
const STRIPE_PUB = cat('pk_', 'live_', '51Nq8ZbLkD3fA9xT7VwY2cRe');
const OPENAI = cat('sk-', 'proj-', 'A1b2C3d4E5f6G7h8I9j0K1l2');
const AWS = cat('AKIA', '3XK9P2QW7LM5ZT8B');
const GH = cat('ghp_', 'Q8w3Er5Ty7Ui9Op1As2Df4Gh6Jk8Lz0Xc3Vb');
const GOOGLE = cat('AIza', 'SyA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6');
const JWT = cat(
  'eyJhbGciOiJIUzI1NiIs',
  'InR5cCI6IkpXVCJ9.',
  'eyJyb2xlIjoic2VydmljZV9yb2xlIn0.',
  'abcDEF123ghiJKL456mnoPQR789stuVWX0yz'
);

const V = (id: string, why: string, rule: 'vibeguard', r: string[], files: Record<string, string>): BenchCase =>
  ({ id, why, expect: { [rule]: r } as BenchCase['expect'], files });
const S = (id: string, why: string, files: Record<string, string>): BenchCase => ({
  id,
  why,
  expect: {},
  files,
});
// Caso que legitimamente aciona regras dos DOIS motores (ex.: .env versionado sem .gitignore).
const B = (id: string, why: string, expect: BenchCase['expect'], files: Record<string, string>): BenchCase => ({
  id,
  why,
  expect,
  files,
});

export const vibeguardCases: BenchCase[] = [
  // ---------------------------------------------------------------- SECRETS_HARDCODED
  V('sec-p01-stripe-live-in-server', 'Chave secreta Stripe live no codigo do servidor.', 'vibeguard', ['SECRETS_HARDCODED'], {
    'src/lib/stripe.ts': L("import Stripe from 'stripe';", `export const stripe = new Stripe('${STRIPE_LIVE}', { apiVersion: '2024-06-20' });`),
  }),
  V('sec-p02-openai-key-in-client', 'Chave OpenAI no componente React (vai para o navegador).', 'vibeguard', ['SECRETS_HARDCODED'], {
    'src/components/Chat.tsx': L("import OpenAI from 'openai';", `const client = new OpenAI({ apiKey: "${OPENAI}", dangerouslyAllowBrowser: true });`),
  }),
  V('sec-p03-aws-access-key', 'Access key da AWS em arquivo de config.', 'vibeguard', ['SECRETS_HARDCODED'], {
    'src/config/aws.js': L('module.exports = {', `  accessKeyId: "${AWS}",`, "  region: 'us-east-1',", '};'),
  }),
  V('sec-p04-github-token', 'Token pessoal do GitHub em script de deploy.', 'vibeguard', ['SECRETS_HARDCODED'], {
    'scripts/deploy.js': L(`const GH = "${GH}";`, "fetch('https://api.github.com/user', { headers: { Authorization: `token ${GH}` } });"),
  }),
  V('sec-p05-hardcoded-db-password', 'Senha longa hardcoded em variavel com nome de password.', 'vibeguard', ['SECRETS_HARDCODED'], {
    'src/db.ts': L('const dbPassword = "hunter2hunter2hunter2hunter2";', 'export const config = { host: "db.internal", password: dbPassword };'),
  }),
  V('sec-p06-jwt-signing-secret', 'Segredo de assinatura de JWT hardcoded (permite forjar qualquer sessao). Nome JWT_SECRET.', 'vibeguard', ['SECRETS_HARDCODED'], {
    'src/auth/jwt.ts': L("import jwt from 'jsonwebtoken';", 'const JWT_SECRET = "d7f3a91b5c2e48069f1a3b7c5d9e2f40";', 'export const sign = (id: string) => jwt.sign({ id }, JWT_SECRET);'),
  }),
  V('sec-p07-supabase-service-role-literal', 'Service role key do Supabase (ignora RLS) como literal, sem nome de variavel revelador.', 'vibeguard', ['SECRETS_HARDCODED'], {
    'src/lib/admin.ts': L("import { createClient } from '@supabase/supabase-js';", `export const admin = createClient('https://abc.supabase.co', "${JWT}");`),
  }),
  V('sec-p08-database-url-with-credentials', 'String de conexao com usuario e senha embutidos.', 'vibeguard', ['SECRETS_HARDCODED'], {
    'src/db.ts': L('const DATABASE_URL = "postgres://admin:Pa55w0rdPa55w0rd@db.internal:5432/app";', 'export default DATABASE_URL;'),
  }),
  B('sec-p09-dotenv-committed-quoted', 'Arquivo .env versionado (sem .gitignore) com chave Stripe live entre aspas.', { vibeguard: ['SECRETS_HARDCODED'], checks: ['ENV_NOT_IGNORED'] }, {
    '.env': L(`STRIPE_SECRET_KEY="${STRIPE_LIVE}"`, 'PORT=3000'),
  }),
  B('sec-p10-dotenv-committed-unquoted', 'Arquivo .env versionado (sem .gitignore), formato normal (sem aspas), com chave OpenAI.', { vibeguard: ['SECRETS_HARDCODED'], checks: ['ENV_NOT_IGNORED'] }, {
    '.env': L(`OPENAI_API_KEY=${OPENAI}`, 'NODE_ENV=production'),
  }),
  V('sec-p11-google-server-key', 'Chave de API do Google (geocoding, cobrada por uso) hardcoded no servidor.', 'vibeguard', ['SECRETS_HARDCODED'], {
    'src/geo.ts': L(`const GEOCODE_API_KEY = "${GOOGLE}";`, 'export const url = (q: string) => `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${GEOCODE_API_KEY}`;'),
  }),

  S('sec-n01-env-var', 'Segredo lido de variavel de ambiente.', {
    'src/lib/stripe.ts': L("import Stripe from 'stripe';", 'export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);'),
  }),
  S('sec-n02-vite-env', 'Chave publica injetada via import.meta.env.', {
    'src/map.ts': 'export const key = import.meta.env.VITE_MAPS_KEY;',
  }),
  S('sec-n03-placeholder', 'Valor de exemplo claramente placeholder.', {
    'src/config.ts': 'const apiKey = "your_api_key_here_replace_me_1234";',
  }),
  S('sec-n04-firebase-public-web-key', 'apiKey do Firebase Web e publica por design (documentacao do Firebase): nao e segredo.', {
    'src/firebase.ts': L('export const firebaseConfig = {', `  apiKey: "${GOOGLE}",`, "  authDomain: 'meu-app.firebaseapp.com',", "  projectId: 'meu-app',", '};'),
  }),
  S('sec-n05-stripe-publishable', 'Chave publicavel do Stripe (pk_) e feita para ficar no cliente.', {
    'src/checkout.ts': L("import { loadStripe } from '@stripe/stripe-js';", `export const stripePromise = loadStripe("${STRIPE_PUB}");`),
  }),
  S('sec-n06-fake-secret-in-test', 'Valor de teste dentro de arquivo .test.ts.', {
    'src/auth.test.ts': L("import { it } from 'vitest';", "it('usa token', () => { const token = 'abcdefghijklmnopqrstuvwxyz123456'; });"),
  }),
  S('sec-n07-short-token-type', 'Constante curta chamada token que nao e credencial.', {
    'src/http.ts': L('const tokenType = "Bearer";', 'export const header = (t: string) => `${tokenType} ${t}`;'),
  }),
  S('sec-n08-env-example', '.env.example com placeholders (padrao recomendado).', {
    '.env.example': L('STRIPE_SECRET_KEY=sk_live_troque_pelo_seu', 'DATABASE_URL=postgres://user:senha@host/db'),
    '.gitignore': '.env*\n!.env.example\n',
  }),
  S('sec-n09-password-input-ui', 'Campo de senha de formulario: nao ha senha hardcoded.', {
    'src/Login.tsx': L('export const Login = () => (', '  <form>', '    <input type="password" name="password" placeholder="Digite sua senha" />', '  </form>', ');'),
  }),

  // ---------------------------------------------------------------- AUTH_CLIENT_SIDE
  V('auth-p01-localstorage-token', 'JWT em localStorage (chave token).', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/login.ts': L('export async function login(email: string, password: string) {', "  const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });", '  const data = await res.json();', "  localStorage.setItem('token', data.token);", '}'),
  }),
  V('auth-p02-sessionstorage-jwt', 'JWT em sessionStorage.', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/login.ts': L('export function save(data: { jwt: string }) {', '  sessionStorage.setItem("jwt", data.jwt);', '}'),
  }),
  V('auth-p03-accesstoken-camel', 'accessToken em localStorage.', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/session.ts': 'export const persist = (r: { accessToken: string }) => localStorage.setItem("accessToken", r.accessToken);',
  }),
  V('auth-p04-access-token-snake', 'access_token em localStorage (nome mais comum em OAuth).', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/session.ts': "export const persist = (r: { access_token: string }) => localStorage.setItem('access_token', r.access_token);",
  }),
  V('auth-p05-authtoken', 'authToken em localStorage.', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/session.ts': "export const persist = (t: string) => localStorage.setItem('authToken', t);",
  }),
  V('auth-p06-constant-key', 'Chave em constante (TOKEN_KEY) em localStorage.', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/session.ts': L("const TOKEN_KEY = 'app_token';", 'export const persist = (t: string) => localStorage.setItem(TOKEN_KEY, t);'),
  }),
  V('auth-p07-property-assignment', 'localStorage.token = ... (atribuicao direta).', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/session.ts': 'export const persist = (t: string) => { (localStorage as any).token = t; };',
  }),
  V('auth-p08-client-cookie', 'Cookie de sessao criado no navegador via document.cookie (nunca pode ser HttpOnly).', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/session.ts': 'export const persist = (t: string) => { document.cookie = "session=" + t + "; path=/"; };',
  }),
  V('auth-p09-zustand-persist-token', 'Store Zustand com persist (localStorage por padrao) guardando o token.', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/store/auth.ts': L("import { create } from 'zustand';", "import { persist } from 'zustand/middleware';", 'export const useAuth = create(persist((set) => ({ token: null as string | null, setToken: (token: string) => set({ token }) }), { name: "auth-storage" }));'),
  }),
  V('auth-p10-supabase-session-manual', 'Sessao do Supabase serializada manualmente em localStorage.', 'vibeguard', ['AUTH_CLIENT_SIDE'], {
    'src/session.ts': "export const persist = (s: unknown) => localStorage.setItem('supabase.auth.token', JSON.stringify(s));",
  }),

  S('auth-n01-theme', 'Preferencia de tema em localStorage.', { 'src/theme.ts': "export const setTheme = (t: string) => localStorage.setItem('theme', t);" }),
  S('auth-n02-language', 'Idioma em localStorage.', { 'src/i18n.ts': "export const setLang = (l: string) => localStorage.setItem('language', l);" }),
  S('auth-n03-httponly-cookie-server', 'Servidor define cookie HttpOnly/Secure/SameSite.', {
    'src/server/login.ts': "export const login = (res: any, sessionId: string) => res.cookie('session', sessionId, { httpOnly: true, secure: true, sameSite: 'strict' });",
  }),
  S('auth-n04-cart-id', 'Identificador de carrinho anonimo em sessionStorage.', { 'src/cart.ts': "export const save = (id: string) => sessionStorage.setItem('cartId', id);" }),
  S('auth-n05-tokenizer-setting', 'Chave contem a palavra token mas e configuracao de UI.', { 'src/prefs.ts': "export const set = () => localStorage.setItem('tokenizerMode', 'fast');" }),
  S('auth-n06-session-key-ui-state', "Chave chamada 'session' guardando apenas filtro de UI (nao credencial).", {
    'src/filters.ts': "export const save = (f: string) => localStorage.setItem('session', JSON.stringify({ filter: f }));",
  }),

  // ---------------------------------------------------------------- SQL_INJECTION
  V('sql-p01-template-interp', 'Query com template string interpolando param da rota.', 'vibeguard', ['SQL_INJECTION'], {
    'src/users.ts': 'export const get = (db: any, req: any) => db.query(`SELECT * FROM users WHERE id = ${req.params.id}`);',
  }),
  V('sql-p02-string-concat', 'Concatenacao de string com dado do usuario.', 'vibeguard', ['SQL_INJECTION'], {
    'src/users.ts': `export const get = (pool: any, email: string) => pool.query("SELECT * FROM users WHERE email = '" + email + "'");`,
  }),
  V('sql-p03-delete-execute', 'DELETE com interpolacao via execute().', 'vibeguard', ['SQL_INJECTION'], {
    'src/sessions.ts': "export const kill = (connection: any, token: string) => connection.execute(`DELETE FROM sessions WHERE token = '${token}'`);",
  }),
  V('sql-p04-insert-interp', 'INSERT interpolando mensagem do usuario.', 'vibeguard', ['SQL_INJECTION'], {
    'src/logs.ts': "export const log = (client: any, msg: string) => client.query(`INSERT INTO logs (msg) VALUES ('${msg}')`);",
  }),
  V('sql-p05-multiline-template', 'Mesma injecao, mas a query esta na linha seguinte ao .query(.', 'vibeguard', ['SQL_INJECTION'], {
    'src/orders.ts': L('export async function list(pool: any, userId: string) {', '  const { rows } = await pool.query(', '    `SELECT * FROM orders WHERE user_id = ${userId}`', '  );', '  return rows;', '}'),
  }),
  V('sql-p06-prisma-queryrawunsafe', 'Prisma $queryRawUnsafe com interpolacao.', 'vibeguard', ['SQL_INJECTION'], {
    'src/users.ts': 'export const find = (prisma: any, email: string) => prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = \'${email}\'`);',
  }),
  V('sql-p07-knex-raw', 'knex.raw com interpolacao.', 'vibeguard', ['SQL_INJECTION'], {
    'src/users.ts': "export const find = (knex: any, name: string) => knex.raw(`SELECT * FROM users WHERE name = '${name}'`);",
  }),
  V('sql-p08-sqlite-all-like', 'sqlite3 db.all() concatenando termo de busca em LIKE.', 'vibeguard', ['SQL_INJECTION'], {
    'src/notes.ts': `export const search = (db: any, q: string, cb: any) => db.all("SELECT * FROM notes WHERE title LIKE '%" + q + "%'", cb);`,
  }),
  V('sql-p09-sequelize-update', 'sequelize.query com UPDATE interpolado (escalada de privilegio).', 'vibeguard', ['SQL_INJECTION'], {
    'src/roles.ts': "export const setRole = (sequelize: any, id: number, role: string) => sequelize.query(`UPDATE users SET role = '${role}' WHERE id = ${id}`);",
  }),
  V('sql-p10-mysql-callback-concat', 'mysql com callback e concatenacao de query string.', 'vibeguard', ['SQL_INJECTION'], {
    'src/items.js': "module.exports = (connection, req, cb) => connection.query('SELECT * FROM items WHERE id = ' + req.query.id, cb);",
  }),

  S('sql-n01-parameterized', 'Query parametrizada ($1).', { 'src/users.ts': "export const get = (db: any, id: string) => db.query('SELECT * FROM users WHERE id = $1', [id]);" }),
  S('sql-n02-prisma-tagged-template', 'Prisma $queryRaw com tagged template (parametrizado automaticamente).', {
    'src/users.ts': 'export const find = (prisma: any, email: string) => prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email}`;',
  }),
  S('sql-n03-orm', 'Consulta via ORM.', { 'src/users.ts': 'export const list = (prisma: any, id: string) => prisma.user.findMany({ where: { id } });' }),
  S('sql-n04-static', 'Query estatica.', { 'src/health.ts': "export const ping = (db: any) => db.query('SELECT 1');" }),
  S('sql-n05-constant-identifier', 'Nome de tabela vindo de constante interna (nao de usuario) + valor parametrizado.', {
    'src/repo.ts': L("const TABLE = 'users';", 'export const get = (db: any, id: string) => db.query("SELECT * FROM " + TABLE + " WHERE id = $1", [id]);'),
  }),
  S('sql-n06-template-no-interp', 'Template string sem interpolacao, com parametro.', { 'src/users.ts': 'export const get = (db: any, id: string) => db.query(`SELECT * FROM users WHERE id = $1`, [id]);' }),
  S('sql-n07-supabase-client', 'Supabase client (PostgREST parametriza).', { 'src/users.ts': "export const get = (supabase: any, id: string) => supabase.from('users').select('*').eq('id', id);" }),

  // ---------------------------------------------------------------- XSS_UNSANITIZED
  V('xss-p01-dangerously-post-content', 'HTML do post exibido sem sanitizar.', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/Post.tsx': "export const Post = ({ post }: any) => <div dangerouslySetInnerHTML={{ __html: post.content }} />;",
  }),
  V('xss-p02-marked-output', 'Saida de marked() nao e sanitizada.', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/Comment.tsx': L("import { marked } from 'marked';", 'export const Comment = ({ comment }: any) => <p dangerouslySetInnerHTML={{ __html: marked(comment.body) }} />;'),
  }),
  V('xss-p03-props-html', 'HTML vindo de props.', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/Rich.tsx': 'export const Rich = (props: { html: string }) => <div dangerouslySetInnerHTML={{__html: props.html}} />;',
  }),
  V('xss-p04-multiline-object', 'Mesmo padrao, com o objeto quebrado em varias linhas.', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/Msg.tsx': L('export const Msg = ({ message }: any) => (', '  <div', '    dangerouslySetInnerHTML={{', '      __html: message.body,', '    }}', '  />', ');'),
  }),
  V('xss-p05-innerhtml-assign', 'element.innerHTML = texto do usuario.', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/render.ts': 'export const show = (el: HTMLElement, userComment: string) => { el.innerHTML = userComment; };',
  }),
  V('xss-p06-innerhtml-location-hash', 'innerHTML recebendo location.hash (XSS refletido baseado em DOM).', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/hash.ts': "document.getElementById('out')!.innerHTML = location.hash.slice(1);",
  }),
  V('xss-p07-jquery-html', 'jQuery .html() com mensagem do servidor/usuario.', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/legacy.js': "$('#result').html(data.message);",
  }),
  V('xss-p08-document-write', 'document.write com parametro da URL.', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/search.js': "document.write(new URLSearchParams(location.search).get('q'));",
  }),
  V('xss-p09-javascript-href', 'href com URL do usuario sem validar protocolo (javascript:).', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/Profile.tsx': 'export const Site = ({ user }: any) => <a href={user.website}>site</a>;',
  }),
  V('xss-p10-insert-adjacent-html', 'insertAdjacentHTML com texto de mensagem.', 'vibeguard', ['XSS_UNSANITIZED'], {
    'src/chat.ts': "export const add = (list: HTMLElement, msg: { text: string }) => list.insertAdjacentHTML('beforeend', msg.text);",
  }),

  S('xss-n01-dompurify', 'Sanitizado com DOMPurify.', {
    'src/Post.tsx': L("import DOMPurify from 'dompurify';", 'export const Post = ({ post }: any) => <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />;'),
  }),
  S('xss-n02-sanitize-html-lib', 'Sanitizado com sanitize-html.', {
    'src/Post.tsx': L("import sanitizeHtml from 'sanitize-html';", 'export const Post = ({ post }: any) => <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />;'),
  }),
  S('xss-n03-textcontent', 'textContent nao interpreta HTML.', { 'src/render.ts': 'export const show = (el: HTMLElement, c: string) => { el.textContent = c; };' }),
  S('xss-n04-react-text-child', 'React escapa texto por padrao.', { 'src/Comment.tsx': 'export const Comment = ({ comment }: any) => <p>{comment.body}</p>;' }),
  S('xss-n05-static-html', 'HTML estatico escrito pelo desenvolvedor.', {
    'src/Badge.tsx': "export const Badge = () => <span dangerouslySetInnerHTML={{ __html: '<b>Novo</b>' }} />;",
  }),
  S('xss-n06-json-ld', 'JSON-LD via JSON.stringify de dados do proprio site (padrao de SEO do Next.js).', {
    'src/Seo.tsx': "export const Seo = ({ jsonLd }: any) => <script type=\"application/ld+json\" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;",
  }),

  // ---------------------------------------------------------------- RATE_LIMIT_MISSING
  V('rl-p01-app-login', 'POST /login sem limitador.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/server.ts': L("import express from 'express';", 'const app = express();', "app.post('/login', async (req, res) => { res.json({ ok: true }); });"),
  }),
  V('rl-p02-signup-with-validate', 'POST /signup com middleware de validacao mas sem limitador.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/routes.ts': L("import { Router } from 'express';", 'const router = Router();', 'router.post("/signup", validate, async (req, res) => { res.json({ ok: true }); });'),
  }),
  V('rl-p03-named-router-login', 'Sub-router nomeado (authRouter) sem limitador.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/auth.ts': "authRouter.post('/login', async (req, res) => { res.json({ ok: true }); });",
  }),
  V('rl-p04-forgot-password', 'Recuperacao de senha sem limitador (enumeracao de contas / spam de e-mail).', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/server.ts': "app.post('/forgot-password', async (req, res) => { res.json({ ok: true }); });",
  }),
  V('rl-p05-prefixed-path', 'Login sob prefixo /api/auth.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/server.ts': "app.post('/api/auth/login', async (req, res) => { res.json({ ok: true }); });",
  }),
  V('rl-p06-nextjs-route-handler', 'Next.js App Router: app/api/login/route.ts sem limitador.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'app/api/login/route.ts': L('export async function POST(req: Request) {', '  const { email, password } = await req.json();', '  return Response.json({ ok: Boolean(email && password) });', '}'),
  }),
  V('rl-p07-fastify-login', 'Fastify sem limitador.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/server.ts': "fastify.post('/login', async (req: any, reply: any) => reply.send({ ok: true }));",
  }),
  V('rl-p08-versioned-register', 'Registro sob /api/v1.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/server.ts': "app.post('/api/v1/register', async (req, res) => { res.json({ ok: true }); });",
  }),
  V('rl-p09-router-route-chain', 'router.route("/login").post(...) sem limitador.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/auth.ts': "router.route('/login').post(async (req, res) => { res.json({ ok: true }); });",
  }),
  V('rl-p10-reset-password', 'Reset de senha sem limitador.', 'vibeguard', ['RATE_LIMIT_MISSING'], {
    'src/server.ts': "app.post('/reset-password', async (req, res) => { res.json({ ok: true }); });",
  }),

  S('rl-n01-limiter-var', 'Limitador nomeado limiter no proprio handler.', { 'src/server.ts': "app.post('/login', limiter, async (req, res) => { res.json({ ok: true }); });" }),
  S('rl-n02-inline-ratelimit', 'rateLimit(...) inline.', {
    'src/server.ts': "app.post('/login', rateLimit({ windowMs: 60000, max: 5 }), async (req, res) => { res.json({ ok: true }); });",
  }),
  S('rl-n03-loginlimiter-var', 'Limitador com nome loginLimiter (nome muito comum).', {
    'src/server.ts': "app.post('/login', loginLimiter, async (req, res) => { res.json({ ok: true }); });",
  }),
  S('rl-n04-global-limiter', 'Limitador global via app.use antes das rotas (protege /login).', {
    'src/server.ts': L('app.use(rateLimit({ windowMs: 60000, max: 100 }));', "app.post('/login', async (req, res) => { res.json({ ok: true }); });"),
  }),
  S('rl-n05-non-auth-route', 'Rota comum, fora do escopo de forca bruta.', { 'src/server.ts': "app.post('/api/items', async (req, res) => { res.json({ ok: true }); });" }),
  S('rl-n06-get-login-page', 'GET que so renderiza a pagina de login.', { 'src/server.ts': "app.get('/login', (req, res) => res.render('login'));" }),
];
