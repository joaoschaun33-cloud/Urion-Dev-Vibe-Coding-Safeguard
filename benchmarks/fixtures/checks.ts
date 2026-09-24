// Corpus SINTETICO dos 8 detectores do `urion-checks` (R1-R9 + N+1). Mesmas regras do
// vibeguard.ts: padroes reais de apps gerados por IA, casos dificeis incluidos de
// proposito (positivos que a heuristica pode perder; negativos que ela pode acusar).
import type { BenchCase, ChecksRule } from '../lib/types';

const L = (...lines: string[]): string => lines.join('\n');

const P = (id: string, why: string, rules: ChecksRule[], files: Record<string, string>): BenchCase => ({
  id,
  why,
  expect: { checks: rules },
  files,
});
// .env versionado COM segredo: o config gate acusa o arquivo E o vibeguard acusa o segredo dentro.
const E = (id: string, why: string, files: Record<string, string>): BenchCase => ({
  id,
  why,
  expect: { checks: ['ENV_NOT_IGNORED'], vibeguard: ['SECRETS_HARDCODED'] },
  files,
});
const S = (id: string, why: string, files: Record<string, string>): BenchCase => ({
  id,
  why,
  expect: {},
  files,
});

const SQL = 'db/migrations/001_init.sql';
// Layout real do Supabase CLI. Decisao de projeto medida em repositorios reais: o RLS so e o modelo
// de seguranca quando ha evidencia de Supabase (pasta supabase/, dependencia @supabase/* ou
// auth.uid() no SQL); 16% dos alertas de RLS vinham de projetos Postgres sem Supabase.
const SB_SQL = 'supabase/migrations/20240101000000_init.sql';
// Versionar .env so e vazamento se houver segredo dentro (17 de 23 alertas reais eram so VITE_*).
const ENV_SECRET = 'JWT_SECRET=umsegredolongodemais12345';

export const checksCases: BenchCase[] = [
  // ---------------------------------------------------------------- RLS_MISSING
  P('rls-p01-public-profiles', 'Tabela em schema public do Supabase sem RLS.', ['RLS_MISSING'], {
    [SB_SQL]: L('create table public.profiles (', '  id uuid primary key,', '  email text', ');'),
  }),
  P('rls-p02-plain-todos', 'Tabela sem RLS em projeto Supabase.', ['RLS_MISSING'], { [SB_SQL]: 'create table todos (id serial primary key, title text, user_id uuid);' }),
  P('rls-p03-one-of-two', 'Duas tabelas; so a primeira tem RLS.', ['RLS_MISSING'], {
    [SB_SQL]: L('create table public.a (id int);', 'alter table public.a enable row level security;', 'create table public.b (id int, secret text);'),
  }),
  P('rls-p04-policy-without-enable', 'Policies criadas mas RLS nunca habilitado (policies nao valem nada).', ['RLS_MISSING'], {
    [SQL]: L('create table public.notes (id int, owner uuid);', 'create policy "own" on public.notes for select using (auth.uid() = owner);'),
  }),
  P('rls-p05-if-not-exists', 'create table if not exists sem RLS.', ['RLS_MISSING'], {
    [SB_SQL]: 'create table if not exists public.messages (id bigint primary key, body text);',
  }),
  P('rls-p06-quoted-schema-dump', 'Formato de dump do Supabase/pg_dump: CREATE TABLE "public"."orders", sem RLS.', ['RLS_MISSING'], {
    [SB_SQL]: 'CREATE TABLE "public"."orders" ("id" bigint NOT NULL, "user_id" uuid, "total" numeric);',
  }),

  S('rls-n01-enabled', 'Tabela com RLS habilitado.', { [SQL]: L('create table public.users (id int);', 'alter table users enable row level security;') }),
  S('rls-n02-uppercase-schema-qualified', 'RLS em maiusculas com schema.', {
    [SQL]: L('CREATE TABLE public.items (id int);', 'ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;'),
  }),
  S('rls-n03-temp-table', 'Tabela temporaria (nao fica exposta via API).', { [SQL]: 'create temporary table tmp_import (id int);' }),
  S('rls-n04-prisma-backend-migration', 'Migration do Prisma em app com backend proprio (acesso ao banco so pelo servidor; RLS nao e o modelo de seguranca).', {
    'prisma/migrations/0001_init/migration.sql': 'CREATE TABLE "User" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));',
  }),
  S('rls-n05-commented-create', 'create table apenas em comentario.', { [SQL]: L('-- create table public.ghost (id int);', 'select 1;') }),
  S('rls-n06-plain-postgres-no-supabase', 'Postgres comum, sem nenhum sinal de Supabase (sem pasta supabase/, dependencia ou auth.uid()): RLS nao e o modelo de seguranca. Decisao de projeto: nao acusar.', {
    [SQL]: 'create table todos (id serial primary key, title text, user_id uuid);',
  }),
  S('rls-n07-enabled-in-another-migration', 'RLS ativado em OUTRA migracao do mesmo projeto (44% dos alertas reais eram isso).', {
    [SB_SQL]: 'create table public.tasks (id int, owner uuid);',
    'supabase/migrations/20240102000000_rls.sql': 'alter table public.tasks enable row level security;',
  }),
  S('rls-n08-non-public-schema', 'Tabela em schema interno (private), nao exposto pela API do Supabase.', {
    [SB_SQL]: 'create table private.audit_log (id int, payload jsonb);',
  }),

  // ---------------------------------------------------------------- ROUTE_NO_AUTH
  P('ra-p01-users-by-id', 'GET /users/:id sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "router.get('/users/:id', async (req, res) => { res.json(await getUser(req.params.id)); });" }),
  P('ra-p02-admin-delete', 'DELETE /admin/users/:id sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "app.delete('/admin/users/:id', async (req, res) => { await remove(req.params.id); res.sendStatus(204); });" }),
  P('ra-p03-orders-post', 'POST /api/orders sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "app.post('/api/orders', async (req, res) => { res.json(await createOrder(req.body)); });" }),
  P('ra-p04-profile', 'GET /api/profile sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "app.get('/api/profile', async (req, res) => { res.json(await profile(req)); });" }),
  P('ra-p05-settings-put', 'PUT /api/settings sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "app.put('/api/settings', async (req, res) => { res.json(await save(req.body)); });" }),
  P('ra-p06-nextjs-admin-route', 'Next.js App Router: GET /api/admin/users sem checagem de sessao.', ['ROUTE_NO_AUTH'], {
    'app/api/admin/users/route.ts': L('export async function GET() {', '  const users = await prisma.user.findMany();', '  return Response.json(users);', '}'),
  }),
  P('ra-p07-fastify-users', 'Fastify GET /api/users sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "fastify.get('/api/users', async () => listUsers());" }),
  P('ra-p08-router-route-chain', 'router.route("/users").get(...) sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "router.route('/users').get(async (req, res) => { res.json(await listUsers()); });" }),
  P('ra-p09-billing-invoices', 'GET /api/billing/invoices sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "app.get('/api/billing/invoices', async (req, res) => { res.json(await invoices()); });" }),
  P('ra-p10-role-escalation', 'PATCH que altera papel de conta sem auth.', ['ROUTE_NO_AUTH'], { 'src/routes.ts': "app.patch('/api/accounts/:id/role', async (req, res) => { res.json(await setRole(req.params.id, req.body.role)); });" }),

  S('ra-n01-require-auth', 'Rota com requireAuth.', { 'src/routes.ts': "router.post('/admin', requireAuth, async (req, res) => { res.json({ ok: true }); });" }),
  S('ra-n02-auth-middleware', 'Rota com authMiddleware.', { 'src/routes.ts': "router.get('/users', authMiddleware, async (req, res) => { res.json([]); });" }),
  S('ra-n03-health', 'Healthcheck publico.', { 'src/routes.ts': "router.get('/health', (req, res) => res.send('ok'));" }),
  S('ra-n04-router-level-auth', 'router.use(requireAuth) antes das rotas: todas protegidas.', {
    'src/routes.ts': L('router.use(requireAuth);', "router.get('/users', async (req, res) => { res.json([]); });"),
  }),
  S('ra-n05-public-optout', 'Marcada como publica de proposito.', { 'src/routes.ts': L('// PUBLIC: catalogo aberto', "router.get('/users/list', async (req, res) => { res.json([]); });") }),
  S('ra-n06-public-catalog', 'Catalogo publico (nao sensivel).', { 'src/routes.ts': "app.get('/api/products', async (req, res) => { res.json([]); });" }),
  S('ra-n07-app-level-auth', 'app.use("/api", authenticate) protege tudo abaixo.', {
    'src/server.ts': L("app.use('/api', authenticate);", "app.get('/api/orders', async (req, res) => { res.json([]); });"),
  }),
  S('ra-n08-passport', 'Protegida por passport.authenticate.', {
    'src/routes.ts': "app.get('/api/orders', passport.authenticate('jwt', { session: false }), async (req, res) => { res.json([]); });",
  }),

  // ---------------------------------------------------------------- ENV_NOT_IGNORED
  E('env-p01-no-gitignore', '.env COM SEGREDO e sem nenhum .gitignore.', { '.env': ENV_SECRET }),
  E('env-p02-gitignore-lacks-env', '.env com segredo; .gitignore existe mas nao cobre .env.', { '.env': ENV_SECRET, '.gitignore': 'node_modules\ndist\n' }),
  E('env-p03-dotenv-does-not-cover-local', '.gitignore ignora so ".env"; o arquivo .env.local (com segredo) continua rastreado pelo Git.', {
    '.env.local': ENV_SECRET,
    '.gitignore': '.env\nnode_modules\n',
  }),
  E('env-p04-production-file', '.env.production com segredo versionado.', { '.env.production': ENV_SECRET, '.gitignore': 'node_modules\n' }),
  E('env-p05-subdir-env', 'server/.env com segredo sem cobertura no .gitignore da raiz.', { 'server/.env': ENV_SECRET, '.gitignore': 'node_modules\n' }),
  E('env-p06-envrc-only', '.env com segredo; .gitignore so cobre .envrc, nao .env.', { '.env': ENV_SECRET, '.gitignore': '.envrc\n' }),

  S('env-n01-wildcard', '.env* no .gitignore.', { '.env': 'PORT=3000', '.env.local': 'PORT=3001', '.gitignore': '.env*\n' }),
  S('env-n02-dotenv-only', 'Apenas .env, coberto.', { '.env': 'PORT=3000', '.gitignore': '.env\nnode_modules\n' }),
  S('env-n03-example-only', 'So .env.example.', { '.env.example': 'PORT=', '.gitignore': 'node_modules\n' }),
  S('env-n04-nested-gitignore', 'Monorepo: .gitignore do proprio pacote cobre o .env dele.', {
    'apps/api/.env': 'PORT=3000',
    'apps/api/.gitignore': '.env\n',
  }),
  S('env-n05-no-env-files', 'Projeto sem nenhum .env.', { 'src/index.ts': 'export {};', '.gitignore': 'node_modules\n' }),
  S('env-n06-public-vars-only', '.env versionado que so tem variaveis publicas do framework (VITE_*): nao vaza segredo.', {
    '.env': L('VITE_SUPABASE_URL=https://abc.supabase.co', 'VITE_SUPABASE_PUBLISHABLE_KEY=abcdefghijklmnopqrstuvwxyz0123456789'),
  }),

  // ---------------------------------------------------------------- USERID_FROM_CLIENT
  P('uid-p01-body-userid', 'userId lido de req.body.', ['USERID_FROM_CLIENT'], { 'src/todos.ts': "export const h = async (req: any, res: any) => { const userId = req.body.userId; res.json(await list(userId)); };" }),
  P('uid-p02-destructured', 'userId desestruturado de req.body.', ['USERID_FROM_CLIENT'], { 'src/todos.ts': "export const h = async (req: any) => { const { userId, title } = req.body; return create(userId, title); };" }),
  P('uid-p03-snake-case', 'user_id vindo do corpo.', ['USERID_FROM_CLIENT'], { 'src/todos.ts': "export const h = async (req: any) => { const { user_id, title } = req.body; return create(user_id, title); };" }),
  P('uid-p04-nextjs-request-json', 'Next.js: userId lido de await request.json().', ['USERID_FROM_CLIENT'], {
    'app/api/todos/route.ts': L('export async function POST(request: Request) {', '  const { userId, title } = await request.json();', '  return Response.json(await create(userId, title));', '}'),
  }),
  P('uid-p05-supabase-insert-body', 'Insert confiando em user_id do corpo.', ['USERID_FROM_CLIENT'], {
    'src/todos.ts': "export const h = async (req: any) => supabase.from('todos').insert({ title: req.body.title, user_id: req.body.user_id });",
  }),
  P('uid-p06-owner-id', 'ownerId vindo do corpo (mesmo problema, outro nome).', ['USERID_FROM_CLIENT'], { 'src/projects.ts': "export const h = async (req: any) => { const ownerId = req.body.ownerId; return create(ownerId); };" }),
  P('uid-p07-uid', 'uid vindo do corpo.', ['USERID_FROM_CLIENT'], { 'src/projects.ts': "export const h = async (req: any) => { const uid = req.body.uid; return load(uid); };" }),
  P('uid-p08-zod-input-userid', 'Schema de entrada aceita userId do cliente e ele e usado para autorizar.', ['USERID_FROM_CLIENT'], {
    'src/api.ts': L("const input = z.object({ userId: z.string(), title: z.string() });", 'export const create = async (raw: unknown) => { const data = input.parse(raw); return db.todo.create({ data: { ownerId: data.userId, title: data.title } }); };'),
  }),

  S('uid-n01-req-user', 'userId vindo do usuario autenticado.', { 'src/todos.ts': 'export const h = async (req: any) => { const userId = req.user.id; return list(userId); };' }),
  S('uid-n02-session', 'userId vindo da sessao do servidor.', { 'src/todos.ts': 'export const h = async () => { const session = await getServerSession(); const userId = session.user.id; return list(userId); };' }),
  S('uid-n03-clerk-auth', 'userId vindo do Clerk (servidor).', { 'src/todos.ts': "export const h = async () => { const { userId } = auth(); return list(userId); };" }),
  S('uid-n04-admin-assigns', 'Endpoint de admin (verificado) onde o userId no corpo e legitimo.', {
    'src/admin.ts': L('export const h = async (req: any, res: any) => {', '  if (!req.user.isAdmin) { return res.sendStatus(403); }', '  const { userId } = req.body;', '  return res.json(await assign(userId));', '};'),
  }),
  S('uid-n05-body-no-userid', 'Corpo sem userId.', { 'src/todos.ts': 'export const h = async (req: any) => { const { title } = req.body; return create(req.user.id, title); };' }),
  S('uid-n06-params-with-ownership', 'userId em params com checagem de posse.', {
    'src/todos.ts': L('export const h = async (req: any, res: any) => {', '  if (req.params.userId !== req.user.id) { return res.sendStatus(403); }', '  return res.json(await list(req.params.userId));', '};'),
  }),

  // ---------------------------------------------------------------- ERROR_SWALLOWED
  P('err-p01-empty-catch', 'catch vazio com binding.', ['ERROR_SWALLOWED'], { 'src/pay.ts': 'export async function charge() { try { await gateway.charge(); } catch (e) {} }' }),
  P('err-p02-promise-catch-noop', '.catch(() => {}) em promise.', ['ERROR_SWALLOWED'], { 'src/pay.ts': 'export const charge = () => { gateway.charge().catch(() => {}); };' }),
  P('err-p03-catch-no-binding', 'catch sem binding e vazio.', ['ERROR_SWALLOWED'], { 'src/pay.ts': 'export async function charge() { try { await gateway.charge(); } catch {} }' }),
  P('err-p04-comment-ignore', 'catch com comentario "ignore" e sem motivo.', ['ERROR_SWALLOWED'], { 'src/pay.ts': 'export async function charge() { try { await gateway.charge(); } catch (error) { /* ignore */ } }' }),
  P('err-p05-catch-null', '.catch(() => null) descarta a falha.', ['ERROR_SWALLOWED'], { 'src/pay.ts': 'export const charge = () => gateway.charge().catch(() => null);' }),
  P('err-p06-swallow-then-ok', 'Falha do pagamento engolida e a resposta diz ok.', ['ERROR_SWALLOWED'], {
    'src/pay.ts': L('export async function handler(req: any, res: any) {', '  try { await gateway.charge(req.body); } catch (e) {}', '  res.json({ ok: true });', '}'),
  }),
  P('err-p07-empty-return', 'catch que so retorna, sem registrar nem propagar.', ['ERROR_SWALLOWED'], { 'src/pay.ts': 'export async function charge() { try { await gateway.charge(); } catch (e) { return; } }' }),
  P('err-p08-todo-only', 'catch com apenas TODO.', ['ERROR_SWALLOWED'], { 'src/pay.ts': L('export async function charge() {', '  try { await gateway.charge(); } catch (e) {', '    // TODO', '  }', '}') }),

  S('err-n01-logger', 'Erro registrado.', { 'src/pay.ts': 'export async function charge() { try { await gateway.charge(); } catch (e) { logger.error(e); } }' }),
  S('err-n02-rethrow', 'Erro relancado.', { 'src/pay.ts': 'export async function charge() { try { await gateway.charge(); } catch (e) { throw e; } }' }),
  S('err-n03-respond-500', 'Erro vira resposta 500.', { 'src/pay.ts': 'export async function h(req: any, res: any) { try { await gateway.charge(); } catch (e) { res.status(500).json({ error: "falha" }); } }' }),
  S('err-n04-named-handler', 'Promise com handler nomeado.', { 'src/pay.ts': 'export const charge = () => gateway.charge().catch(handleError);' }),
  S('err-n05-documented-best-effort', 'Limpeza best-effort com motivo documentado (intencional).', {
    'src/tmp.ts': L('export function cleanup(p: string) {', '  try { fs.unlinkSync(p); } catch {', '    // best-effort: o arquivo temporario pode ja ter sido removido', '  }', '}'),
  }),
  S('err-n06-warn-handler', 'Promise com callback que registra.', { 'src/pay.ts': 'export const charge = () => gateway.charge().catch((err) => logger.warn(err));' }),

  // ---------------------------------------------------------------- WEBHOOK_UNVERIFIED
  P('wh-p01-stripe-router', 'Webhook Stripe confiando no corpo sem checar assinatura.', ['WEBHOOK_UNVERIFIED'], {
    'src/hooks.ts': L("router.post('/webhooks/stripe', (req, res) => {", '  const event = req.body;', "  if (event.type === 'payment_intent.succeeded') { markPaid(event.data.object.id); }", '  res.sendStatus(200);', '});'),
  }),
  P('wh-p02-paypal-app', 'Webhook PayPal sem verificacao.', ['WEBHOOK_UNVERIFIED'], {
    'src/hooks.ts': L("app.post('/api/webhook/paypal', (req, res) => {", '  markPaid(req.body.resource.id);', '  res.sendStatus(200);', '});'),
  }),
  P('wh-p03-mercadopago-named-router', 'Webhook Mercado Pago em sub-router nomeado.', ['WEBHOOK_UNVERIFIED'], {
    'src/hooks.ts': L("paymentsRouter.post('/mercadopago/webhook', (req, res) => {", '  markPaid(req.body.data.id);', '  res.sendStatus(200);', '});'),
  }),
  P('wh-p04-checkout-webhook', 'Webhook de checkout sem verificacao.', ['WEBHOOK_UNVERIFIED'], {
    'src/hooks.ts': L("app.post('/webhooks/checkout', (req, res) => {", '  markPaid(req.body.orderId);', '  res.sendStatus(200);', '});'),
  }),
  P('wh-p05-nextjs-route', 'Next.js App Router: webhook Stripe sem constructEvent.', ['WEBHOOK_UNVERIFIED'], {
    'app/api/webhooks/stripe/route.ts': L('export async function POST(req: Request) {', '  const event = await req.json();', '  await markPaid(event.data.object.id);', '  return new Response(null, { status: 200 });', '}'),
  }),
  P('wh-p06-express-json-first', 'express.json() antes do handler: o corpo ja foi parseado, entao a assinatura nem seria verificavel.', ['WEBHOOK_UNVERIFIED'], {
    'src/hooks.ts': L("app.post('/stripe/webhook', express.json(), (req, res) => {", '  markPaid(req.body.data.object.id);', '  res.sendStatus(200);', '});'),
  }),
  P('wh-p07-pagseguro-hooks-path', 'Webhook PagSeguro cujo caminho e /hooks/pagseguro (sem a palavra webhook).', ['WEBHOOK_UNVERIFIED'], {
    'src/hooks.ts': L("app.post('/hooks/pagseguro', (req, res) => {", '  markPaid(req.body.reference);', '  res.sendStatus(200);', '});'),
  }),
  P('wh-p08-fastify-stripe', 'Fastify: webhook Stripe sem verificacao.', ['WEBHOOK_UNVERIFIED'], {
    'src/hooks.ts': L("fastify.post('/webhooks/stripe', async (req: any) => {", '  await markPaid(req.body.data.object.id);', '  return { ok: true };', '});'),
  }),

  S('wh-n01-construct-event', 'Verifica assinatura com constructEvent.', {
    'src/hooks.ts': L("router.post('/webhooks/stripe', (req, res) => {", "  const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret);", '  markPaid(event.data.object.id);', '  res.sendStatus(200);', '});'),
  }),
  S('wh-n02-verify-helper', 'Verifica assinatura com helper proprio.', {
    'src/hooks.ts': L("app.post('/api/webhook/paypal', (req, res) => {", '  if (!verifySignature(req)) { return res.sendStatus(401); }', '  markPaid(req.body.resource.id);', '  res.sendStatus(200);', '});'),
  }),
  S('wh-n03-github-webhook', 'Webhook do GitHub (nao e pagamento).', { 'src/hooks.ts': "router.post('/webhooks/github', (req, res) => { res.sendStatus(200); });" }),
  S('wh-n04-router-level-verification', 'Middleware de verificacao aplicado no router inteiro, antes da rota.', {
    'src/hooks.ts': L('router.use(verifyStripeSignature);', "router.post('/webhooks/stripe', (req, res) => {", '  markPaid(req.body.data.object.id);', '  res.sendStatus(200);', '});'),
  }),
  S('wh-n05-signature-header-inline', 'Le e valida o header stripe-signature dentro do handler.', {
    'src/hooks.ts': L("app.post('/webhooks/stripe', (req, res) => {", "  const sig = req.headers['stripe-signature'];", '  if (!sig || !valid(sig, req.rawBody)) { return res.sendStatus(400); }', '  markPaid(req.body.data.object.id);', '  res.sendStatus(200);', '});'),
  }),
  S('wh-n06-non-webhook-payment-route', 'Rota de cobranca autenticada (nao e webhook).', {
    'src/pay.ts': "router.post('/payments/charge', requireAuth, (req, res) => { res.json({ ok: true }); });",
  }),

  // ---------------------------------------------------------------- BODY_UNVALIDATED_WRITE
  P('bw-p01-prisma-create-body', 'prisma.create({ data: req.body }) (mass assignment).', ['BODY_UNVALIDATED_WRITE'], { 'src/users.ts': 'export const h = async (req: any) => prisma.user.create({ data: req.body });' }),
  P('bw-p02-prisma-update-body', 'prisma.update com data: req.body.', ['BODY_UNVALIDATED_WRITE'], { 'src/users.ts': 'export const h = async (req: any) => prisma.post.update({ where: { id: req.params.id }, data: req.body });' }),
  P('bw-p03-mongoose-create', 'Model.create(req.body) (Mongoose).', ['BODY_UNVALIDATED_WRITE'], { 'src/users.ts': 'export const h = async (req: any) => User.create(req.body);' }),
  P('bw-p04-supabase-insert-body', 'supabase.from().insert(req.body).', ['BODY_UNVALIDATED_WRITE'], { 'src/users.ts': "export const h = async (req: any) => supabase.from('profiles').insert(req.body);" }),
  P('bw-p05-mongo-insertone', 'collection.insertOne(req.body).', ['BODY_UNVALIDATED_WRITE'], { 'src/users.ts': "export const h = async (req: any) => db.collection('users').insertOne(req.body);" }),
  P('bw-p06-spread-body', 'Spread de req.body em data.', ['BODY_UNVALIDATED_WRITE'], { 'src/users.ts': 'export const h = async (req: any) => prisma.user.update({ where: { id: req.params.id }, data: { ...req.body } });' }),
  P('bw-p07-nextjs-json-body', 'Next.js: corpo de request.json() direto em data.', ['BODY_UNVALIDATED_WRITE'], {
    'app/api/items/route.ts': L('export async function POST(request: Request) {', '  const body = await request.json();', '  return Response.json(await prisma.item.create({ data: body }));', '}'),
  }),
  P('bw-p08-mongoose-find-update', 'findByIdAndUpdate(id, req.body).', ['BODY_UNVALIDATED_WRITE'], { 'src/users.ts': 'export const h = async (req: any) => User.findByIdAndUpdate(req.params.id, req.body);' }),

  S('bw-n01-parse-first', 'Valida com schema.parse antes de gravar.', {
    'src/users.ts': L("const schema = z.object({ name: z.string().min(1) });", 'export const h = async (req: any) => { const parsed = schema.parse(req.body); return prisma.user.create({ data: parsed }); };'),
  }),
  S('bw-n02-picked-fields', 'Grava so campos especificos (sem mass assignment).', {
    'src/users.ts': 'export const h = async (req: any) => prisma.user.create({ data: { name: String(req.body.name).slice(0, 80) } });',
  }),
  S('bw-n03-validate-middleware', 'Validacao por middleware na propria rota antes do handler.', {
    'src/items.ts': L("router.post('/items', validate(createItemSchema), async (req: any, res: any) => {", '  res.json(await prisma.item.create({ data: req.body }));', '});'),
  }),
  S('bw-n04-safeparse', 'safeParse com tratamento de erro.', {
    'src/users.ts': L('export const h = async (req: any, res: any) => {', '  const r = createSchema.safeParse(req.body);', '  if (!r.success) { return res.status(400).json(r.error); }', '  return res.json(await prisma.user.create({ data: r.data }));', '};'),
  }),
  S('bw-n05-no-writes', 'Sem escrita no banco.', { 'src/users.ts': 'export const h = async (req: any) => ({ echo: req.body });' }),

  // ---------------------------------------------------------------- N_PLUS_ONE
  P('np-p01-for-of-findunique', 'Loop com prisma.findUnique por item.', ['N_PLUS_ONE'], {
    'src/orders.ts': L('export async function withUsers(orders: any[]) {', '  for (const o of orders) {', '    o.user = await prisma.user.findUnique({ where: { id: o.userId } });', '  }', '  return orders;', '}'),
  }),
  P('np-p02-map-async-query', '.map(async ...) com db.query.', ['N_PLUS_ONE'], {
    'src/orders.ts': "export const withUsers = (orders: any[]) => Promise.all(orders.map(async (o) => ({ ...o, user: await db.query('SELECT * FROM users WHERE id = $1', [o.userId]) })));",
  }),
  P('np-p03-promise-all-repo', 'Promise.all(ids.map(repo.findById)).', ['N_PLUS_ONE'], {
    'src/orders.ts': 'export const load = (ids: string[]) => Promise.all(ids.map((id) => userRepository.findById(id)));',
  }),
  P('np-p04-foreach-findone', 'forEach async com findOne.', ['N_PLUS_ONE'], {
    'src/posts.ts': L('export async function attach(posts: any[]) {', '  posts.forEach(async (p) => { p.author = await Author.findOne({ id: p.authorId }); });', '}'),
  }),
  P('np-p05-while-loop-query', 'while com db.query.', ['N_PLUS_ONE'], {
    'src/walk.ts': L('export async function walk(id: string | null) {', '  while (id) {', "    const r = await db.query('SELECT parent_id FROM nodes WHERE id = $1', [id]);", '    id = r.rows[0]?.parent_id ?? null;', '  }', '}'),
  }),
  P('np-p06-supabase-in-map', 'Supabase select dentro de map.', ['N_PLUS_ONE'], {
    'src/orders.ts': "export const withUsers = (orders: any[]) => Promise.all(orders.map(async (o) => ({ ...o, user: (await supabase.from('users').select('*').eq('id', o.user_id)).data })));",
  }),
  P('np-p07-typeorm-findoneby', 'TypeORM findOneBy em for.', ['N_PLUS_ONE'], {
    'src/orders.ts': L('export async function withUsers(orders: any[]) {', '  for (const o of orders) {', '    o.user = await getRepository(User).findOneBy({ id: o.userId });', '  }', '}'),
  }),
  P('np-p08-drizzle-select-in-loop', 'Drizzle select().from().where() dentro de for.', ['N_PLUS_ONE'], {
    'src/orders.ts': L('export async function withUsers(orders: any[]) {', '  for (const o of orders) {', '    o.user = await db.select().from(users).where(eq(users.id, o.userId));', '  }', '}'),
  }),
  P('np-p09-mongoose-find-in-loop', 'Mongoose Model.find() por item.', ['N_PLUS_ONE'], {
    'src/posts.ts': L('export async function withComments(posts: any[]) {', '  for (const p of posts) {', '    p.comments = await Comment.find({ postId: p._id });', '  }', '}'),
  }),

  S('np-n01-batch-in', 'Uma consulta com IN e juncao em memoria.', {
    'src/orders.ts': L('export async function withUsers(orders: any[]) {', '  const users = await prisma.user.findMany({ where: { id: { in: orders.map((o) => o.userId) } } });', '  const byId = new Map(users.map((u) => [u.id, u]));', '  return orders.map((o) => ({ ...o, user: byId.get(o.userId) }));', '}'),
  }),
  S('np-n02-pure-loop', 'Loop com calculo puro.', { 'src/math.ts': 'export const total = (items: any[]) => items.map((i) => i.price * i.qty).reduce((a, b) => a + b, 0);' }),
  S('np-n03-writes-in-loop', 'Escrita em loop (outro problema; nao e N+1 de leitura).', {
    'src/seed.ts': L('export async function seed(names: string[]) {', '  for (const name of names) {', '    await prisma.tag.create({ data: { name } });', '  }', '}'),
  }),
  S('np-n04-single-query', 'Uma unica consulta fora de loops.', { 'src/users.ts': 'export const all = () => prisma.user.findMany();' }),
  S('np-n05-optout', 'Loop pequeno e fixo com opt-out documentado.', {
    'src/small.ts': L('export async function load() {', '  for (const kind of ["a", "b", "c"]) {', '    // N+1-OK: 3 iteracoes fixas', '    await prisma.config.findUnique({ where: { kind } });', '  }', '}'),
  }),
  S('np-n06-in-memory-cache-get', 'Loop chamando cache em memoria (nao e banco).', { 'src/cache.ts': 'export const hits = (keys: string[]) => keys.filter((k) => cache.get(k));' }),
];
