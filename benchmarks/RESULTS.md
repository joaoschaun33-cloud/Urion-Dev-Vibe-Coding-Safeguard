# Benchmark dos detectores (resultado gerado)

> Gerado por `npm run benchmark` (urion-safeguard 3.0.0). **Não edite à mão** — rode o comando de novo.

## Como ler (e por que não confiar cegamente)

- **Corpus sintético:** 199 mini-projetos (114 vulneráveis, 85 seguros), escritos pela própria equipe a partir de padrões reais de apps gerados por IA. **Quem escreveu o corpus conhece os detectores**: os números tendem a ser **otimistas**. O teste que vale é rodar em repositórios reais (passo 3 do plano).
- **Granularidade:** por _caso_ (a regra disparou neste projeto? sim/não), não por linha. Acertar a regra na linha errada conta como acerto.
- **Intervalo de confiança (IC 95%, Wilson):** com poucos casos por regra, o intervalo é largo — e deve ser. Um "100%" com 8 casos ainda é compatível com ~68% na população.
- **Falso positivo** = a regra disparou onde o gabarito diz que não deveria (inclusive disparos incidentais de outras regras).
- **Gabarito é opinião fundamentada:** cada caso tem uma justificativa (`why`); casos discutíveis estão listados abaixo com ela, para quem discordar contestar caso a caso.

## Motor 1 — `npx urion-safeguard vibeguard` (5 regras)

| Regra                | Casos vulneráveis | Detectou (TP) | Perdeu (FN) | Alarme falso (FP) |  Recall (IC 95%) | Precisão (IC 95%) |
| -------------------- | ----------------: | ------------: | ----------: | ----------------: | ---------------: | ----------------: |
| `SECRETS_HARDCODED`  |                17 |            14 |           3 |                 0 |     82% (59–94%) |    100% (78–100%) |
| `AUTH_CLIENT_SIDE`   |                10 |             8 |           2 |                 1 |     80% (49–94%) |      89% (56–98%) |
| `SQL_INJECTION`      |                10 |             6 |           4 |                 1 |     60% (31–83%) |      86% (49–97%) |
| `XSS_UNSANITIZED`    |                10 |             7 |           3 |                 0 |     70% (40–89%) |    100% (65–100%) |
| `RATE_LIMIT_MISSING` |                10 |             4 |           6 |                 1 |     40% (17–69%) |      80% (38–96%) |
| **Total (micro)**    |            **57** |        **39** |      **18** |             **3** | **68% (56–79%)** |  **93% (81–98%)** |

### Erros por regra

#### `SECRETS_HARDCODED`

- **Perdeu** `sec-p06-jwt-signing-secret` — Segredo de assinatura de JWT hardcoded (permite forjar qualquer sessao). Nome JWT_SECRET.
- **Perdeu** `sec-p07-supabase-service-role-literal` — Service role key do Supabase (ignora RLS) como literal, sem nome de variavel revelador.
- **Perdeu** `sec-p08-database-url-with-credentials` — String de conexao com usuario e senha embutidos.

#### `AUTH_CLIENT_SIDE`

- **Perdeu** `auth-p07-property-assignment` — localStorage.token = ... (atribuicao direta).
- **Perdeu** `auth-p09-zustand-persist-token` — Store Zustand com persist (localStorage por padrao) guardando o token.
- **Alarme falso** `auth-n06-session-key-ui-state` — Chave chamada 'session' guardando apenas filtro de UI (nao credencial).

#### `SQL_INJECTION`

- **Perdeu** `sql-p05-multiline-template` — Mesma injecao, mas a query esta na linha seguinte ao .query(.
- **Perdeu** `sql-p06-prisma-queryrawunsafe` — Prisma $queryRawUnsafe com interpolacao.
- **Perdeu** `sql-p07-knex-raw` — knex.raw com interpolacao.
- **Perdeu** `sql-p08-sqlite-all-like` — sqlite3 db.all() concatenando termo de busca em LIKE.
- **Alarme falso** `sql-n05-constant-identifier` — Nome de tabela vindo de constante interna (nao de usuario) + valor parametrizado.

#### `XSS_UNSANITIZED`

- **Perdeu** `xss-p04-multiline-object` — Mesmo padrao, com o objeto quebrado em varias linhas.
- **Perdeu** `xss-p07-jquery-html` — jQuery .html() com mensagem do servidor/usuario.
- **Perdeu** `xss-p09-javascript-href` — href com URL do usuario sem validar protocolo (javascript:).

#### `RATE_LIMIT_MISSING`

- **Perdeu** `rl-p05-prefixed-path` — Login sob prefixo /api/auth.
- **Perdeu** `rl-p06-nextjs-route-handler` — Next.js App Router: app/api/login/route.ts sem limitador.
- **Perdeu** `rl-p07-fastify-login` — Fastify sem limitador.
- **Perdeu** `rl-p08-versioned-register` — Registro sob /api/v1.
- **Perdeu** `rl-p09-router-route-chain` — router.route("/login").post(...) sem limitador.
- **Perdeu** `rl-p10-reset-password` — Reset de senha sem limitador.
- **Alarme falso** `rl-n03-loginlimiter-var` — Limitador com nome loginLimiter (nome muito comum).

## Motor 2 — `urion-checks` (R1–R9 + N+1)

| Regra                    | Casos vulneráveis | Detectou (TP) | Perdeu (FN) | Alarme falso (FP) |  Recall (IC 95%) | Precisão (IC 95%) |
| ------------------------ | ----------------: | ------------: | ----------: | ----------------: | ---------------: | ----------------: |
| `RLS_MISSING`            |                 6 |             6 |           0 |                 0 |   100% (61–100%) |    100% (61–100%) |
| `ROUTE_NO_AUTH`          |                10 |             7 |           3 |                 0 |     70% (40–89%) |    100% (65–100%) |
| `ENV_NOT_IGNORED`        |                 8 |             8 |           0 |                 0 |   100% (68–100%) |    100% (68–100%) |
| `USERID_FROM_CLIENT`     |                 8 |             2 |           6 |                 1 |      25% (7–59%) |      67% (21–94%) |
| `ERROR_SWALLOWED`        |                 8 |             4 |           4 |                 0 |     50% (22–78%) |    100% (51–100%) |
| `WEBHOOK_UNVERIFIED`     |                 8 |             5 |           3 |                 1 |     63% (31–86%) |      83% (44–97%) |
| `BODY_UNVALIDATED_WRITE` |                 8 |             2 |           6 |                 1 |      25% (7–59%) |      67% (21–94%) |
| `N_PLUS_ONE`             |                 9 |             6 |           3 |                 0 |     67% (35–88%) |    100% (61–100%) |
| **Total (micro)**        |            **65** |        **40** |      **25** |             **3** | **62% (49–72%)** |  **93% (81–98%)** |

### Erros por regra

#### `ROUTE_NO_AUTH`

- **Perdeu** `ra-p06-nextjs-admin-route` — Next.js App Router: GET /api/admin/users sem checagem de sessao.
- **Perdeu** `ra-p07-fastify-users` — Fastify GET /api/users sem auth.
- **Perdeu** `ra-p08-router-route-chain` — router.route("/users").get(...) sem auth.

#### `USERID_FROM_CLIENT`

- **Perdeu** `uid-p03-snake-case` — user_id vindo do corpo.
- **Perdeu** `uid-p04-nextjs-request-json` — Next.js: userId lido de await request.json().
- **Perdeu** `uid-p05-supabase-insert-body` — Insert confiando em user_id do corpo.
- **Perdeu** `uid-p06-owner-id` — ownerId vindo do corpo (mesmo problema, outro nome).
- **Perdeu** `uid-p07-uid` — uid vindo do corpo.
- **Perdeu** `uid-p08-zod-input-userid` — Schema de entrada aceita userId do cliente e ele e usado para autorizar.
- **Alarme falso** `uid-n04-admin-assigns` — Endpoint de admin (verificado) onde o userId no corpo e legitimo.

#### `ERROR_SWALLOWED`

- **Perdeu** `err-p04-comment-ignore` — catch com comentario "ignore" e sem motivo.
- **Perdeu** `err-p05-catch-null` — .catch(() => null) descarta a falha.
- **Perdeu** `err-p07-empty-return` — catch que so retorna, sem registrar nem propagar.
- **Perdeu** `err-p08-todo-only` — catch com apenas TODO.

#### `WEBHOOK_UNVERIFIED`

- **Perdeu** `wh-p05-nextjs-route` — Next.js App Router: webhook Stripe sem constructEvent.
- **Perdeu** `wh-p07-pagseguro-hooks-path` — Webhook PagSeguro cujo caminho e /hooks/pagseguro (sem a palavra webhook).
- **Perdeu** `wh-p08-fastify-stripe` — Fastify: webhook Stripe sem verificacao.
- **Alarme falso** `wh-n04-router-level-verification` — Middleware de verificacao aplicado no router inteiro, antes da rota.

#### `BODY_UNVALIDATED_WRITE`

- **Perdeu** `bw-p03-mongoose-create` — Model.create(req.body) (Mongoose).
- **Perdeu** `bw-p04-supabase-insert-body` — supabase.from().insert(req.body).
- **Perdeu** `bw-p05-mongo-insertone` — collection.insertOne(req.body).
- **Perdeu** `bw-p06-spread-body` — Spread de req.body em data.
- **Perdeu** `bw-p07-nextjs-json-body` — Next.js: corpo de request.json() direto em data.
- **Perdeu** `bw-p08-mongoose-find-update` — findByIdAndUpdate(id, req.body).
- **Alarme falso** `bw-n03-validate-middleware` — Validacao por middleware na propria rota antes do handler.

#### `N_PLUS_ONE`

- **Perdeu** `np-p06-supabase-in-map` — Supabase select dentro de map.
- **Perdeu** `np-p08-drizzle-select-in-loop` — Drizzle select().from().where() dentro de for.
- **Perdeu** `np-p09-mongoose-find-in-loop` — Mongoose Model.find() por item.
