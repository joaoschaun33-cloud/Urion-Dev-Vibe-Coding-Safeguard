# Decisions Log — Registro de Decisões Arquiteturais

> Documente TODAS as decisões arquiteturais significativas. A IA usa este arquivo para entender o "porquê" das escolhas.

> **Fonte única (atualizado 2026-09-17):** decisões arquiteturais **formais**
> (com Status/Contexto/Consequências/Alternativas completos) vivem em
> `docs/adrs/*.md` — este arquivo é o **índice cronológico** delas mais o lugar
> para decisões **táticas** menores que não justificam um ADR completo (ex.: "por
> que essa lib de log", "por que esse nome de campo"). Antes deste ajuste, duas
> decisões (FSD e RFC 7807) estavam escritas por completo aqui **e** em ADR
> próprio — risco de as duas versões divergirem com o tempo. Agora só o ADR tem o
> texto completo; aqui fica o ponteiro.

---

## Formato (para decisões táticas registradas diretamente aqui)

```
### [DATA] — [TÍTULO_DA_DECISÃO]

**Status**: Proposta / Aceita / Depreciada / Substituída
**Contexto**: [Qual problema estávamos resolvendo?]
**Decisão**: [O que decidimos fazer?]
**Consequências**:
- Positivas: [...]
- Negativas: [...]
**Alternativas consideradas**:
- [Alternativa 1] — rejeitada porque [...]
- [Alternativa 2] — rejeitada porque [...]
```

Para decisão **arquitetural** (afeta estrutura de camadas, escolha de stack,
padrão que atravessa múltiplas features): crie um ADR novo em `docs/adrs/NNN-titulo.md`
seguindo o formato dos existentes, adicione ao índice em `docs/adrs/README.md`, e
registre aqui só a linha-ponteiro (data + título + link).

---

## Índice cronológico de ADRs (fonte completa em `docs/adrs/`)

| Data       | ADR                                              | Decisão                                                                |
| ---------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| 2026-07-31 | [001](adrs/001-feature-sliced-design.md)         | Adoção da Arquitetura Feature-Sliced Design (FSD)                      |
| 2026-07-31 | [002](adrs/002-awilix-dependency-injection.md)   | Injeção de Dependências com Awilix Container                           |
| 2026-07-31 | [003](adrs/003-prisma-postgresql-persistence.md) | Persistência Relacional com Prisma ORM e PostgreSQL                    |
| 2026-07-31 | [004](adrs/004-rfc-7807-problem-details.md)      | Padronização de Respostas de Erro com RFC 7807 (Problem Details)       |
| 2026-07-31 | [005](adrs/005-bullmq-redis-async-jobs.md)       | Processamento Assíncrono e Eventos com BullMQ e Redis                  |
| 2026-07-31 | [006](adrs/006-transactional-outbox-pattern.md)  | Transactional Outbox Pattern para Mensageria Resiliente                |
| 2026-07-31 | [007](adrs/007-liveness-readiness-probes.md)     | Padronização de Probes de Saúde (Liveness e Readiness) para Kubernetes |

## Decisões táticas (registradas diretamente aqui)

### 2026-09-17 — Posicionamento primário: Produto (Urion CLI/MCP), template como porta secundária

**Status**: Aceita
**Contexto**: O repositório tem duas ofertas construídas em paralelo — (1) o
produto `urion-safeguard` (CLI + servidor MCP, com tese de mercado, concorrência
mapeada e métricas de sucesso em `posicionamento-estrategia.md`) e (2) uma
metodologia completa de vibe coding profissional (FSD, SDD, ADRs, Dogma Zero) em
`docs/`. O README comunicava só (1); a documentação profunda só (2); um
visitante não sabia qual das duas era a oferta principal.
**Decisão**: Comunicar primariamente como Produto. O README continua focado no
`npx urion-safeguard`; foi adicionada uma seção curta de ponte
("🏗️ Construindo um projeto do zero") linkando para `QUICKSTART.md` e `docs/`
para quem quer a metodologia completa, sem competir pela mensagem principal.
**Consequências**:

- Positivas: mensagem única e clara na porta de entrada (README), alinhada ao
  único documento com tese de mercado e métricas definidas; reduz a ambiguidade
  que o princípio "credibilidade primeiro" do roadmap já pedia para eliminar.
- Negativas: a metodologia completa fica menos visível para quem chega pelo
  README — mitigado pela seção de ponte, mas não é destaque.
  **Alternativas consideradas**:
- Comunicar como Template metodológico — rejeitada: nenhum documento de
  estratégia/mercado sustenta essa oferta como principal hoje.
- Duas portas de entrada com igual destaque — rejeitada por ora: mais trabalho
  de comunicação do que o estágio atual do produto (1 star, 0 uso comprovado,
  por `posicionamento-estrategia.md`) justifica; revisitar se a adoção do CLI
  validar a tese de mercado.

### 2026-09-17 — Ratchet de cobertura de testes em vez de limiar aspiracional

**Status**: Aceita
**Contexto**: `vitest.config.ts` exigia 85% linhas/statements/funções e 80%
branches, mas a cobertura real medida era 67,98%/76%/76,04% — o limiar sempre
reprovaria. Isso não aparecia em lugar nenhum porque o `ci.yml` rodava
`npm run test` (sem cobertura) num step chamado, de forma enganosa, "Coverage
Gate". Dois overclaims silenciosos: um limiar que nunca era cumprido e um nome
de step que prometia uma checagem que não existia.
**Decisão**: Baixar o limiar do `vitest.config.ts` para bater com a cobertura
real medida (piso: 67% linhas/statements, 76% branches/funções) e fazer o
`ci.yml` rodar `npm run test:coverage` de verdade. O piso vira um "ratchet":
protege contra regressão a partir de agora, sem fingir que a meta de 80%
(AGENTS.md/vision.md) já foi atingida.
**Consequências**:

- Positivas: CI para de mentir sobre cobrir cobertura; qualquer PR que reduza
  cobertura quebra o build de verdade; a meta de 80% continua declarada e
  visível (roadmap 3.1), só não é fingida como já cumprida.
- Negativas: o piso de 67%/76% é baixo — não é uma vitória, é o fim de uma
  mentira silenciosa. Ainda falta o trabalho real de escrever testes para
  arquivos com 0% de cobertura (`shared/config/env.ts`,
  `shared/http/health-check.ts`, `shared/domain/domain-event-bus.ts`, entre
  outros) para subir o piso até 80%+.
  **Alternativas consideradas**:
- Manter 85%/80% e deixar o CI vermelho até alguém escrever os testes —
  rejeitada: travaria todo PR imediatamente sem plano de correção, e o
  objetivo desta sessão era parar o sangramento de honestidade, não um sprint
  de testes.
- Não mexer e continuar sem rodar `test:coverage` no CI — rejeitada: mantém o
  overclaim ativo (o nome do step já prometia uma checagem que não existe).

### 2026-09-17 — Scanner do produto lê cobertura real em vez de estimar por proxy

**Status**: Aceita
**Contexto**: `bin/lib/verdict.cjs` (usado pelo `npx urion-safeguard scanner`,
o comando que roda contra o projeto de QUALQUER terceiro) calculava
"cobertura estimada" como `testFiles/codeFiles * 100` — contagem de arquivos,
não execução de teste. Rodado contra este próprio repo, essa proxy dava ~20%;
a cobertura real medida por `vitest --coverage` é 68%. Quase 50 pontos de
diferença, na direção que mais importa (subestimar quando na verdade está
melhor, ou o oposto em outro projeto) — um número que parece uma medição e não
é.
**Decisão**: Criar `bin/lib/coverage-reader.cjs`, que lê
`coverage/coverage-summary.json` (formato Istanbul, gerado por Vitest/Jest/nyc
com o reporter `json-summary`) se o projeto escaneado já rodou seus testes com
cobertura. `deriveStatus` (em `verdict.cjs` e no espelho TS
`scanner-verdict.ts`) ganhou um parâmetro `coverageMeasured`: quando não há
relatório, o veredito diz "cobertura não medida" em vez de mostrar um
percentual inventado — e continua sem poder receber o selo "blindado", porque
"não sabemos" não é "está tudo bem". `vitest.config.ts` deste repo passou a
gerar esse relatório (reporter `json-summary` adicionado) para servir de caso
de teste real.
**Decisão explícita de NÃO fazer**: o Urion não executa os testes do projeto
de terceiro para gerar a cobertura automaticamente. Rodar `npm test`/`pytest`
alheio sem saber se é seguro (efeitos colaterais em banco real, chamadas de
rede, testes que travam) contradiz a promessa de "zero-fricção, 3 segundos" do
`npx urion-safeguard` e abriria superfície de risco desproporcional ao ganho.
Fica como possível item futuro, com escopo próprio (execução sandboxed, opt-in
explícito), não como parte desta correção.
**Consequências**:

- Positivas: quem usa o scanner do produto agora vê um número real ou um aviso
  honesto — nunca mais um número fabricado que parece medição.
- Negativas: para projetos sem relatório de cobertura gerado (a maioria dos
  "vibe coders" iniciantes, público primário do Urion), o veredito vai dizer
  "não medida" — não é uma resposta tão satisfatória quanto um número, mas é a
  resposta honesta; o CLI já orienta como gerar o relatório.
  **Alternativas consideradas**:
- Manter a proxy mas renomear para "estimativa (não é cobertura real)" —
  rejeitada: ainda seria um número sem relação confiável com qualidade real;
  melhor não mostrar número nenhum do que mostrar um que parece preciso e não
  é.
- Executar os testes do projeto automaticamente para sempre ter um número —
  rejeitada por risco de efeito colateral e tempo, ver "Decisão explícita de
  NÃO fazer" acima.

### 2026-09-17 — Ruleset R1–R10: só regras com heurística confiável; documentar as que ficam de fora

**Status**: Aceita
**Contexto**: Roadmap item 2.4 pedia cobrir R1–R10 (ver
`docs/research/aprendizados-workflow-docs.md`). Faltavam R2 (userId do
cliente), R6 (erro engolido), R7 (validação de schema) e R9 (assinatura de
webhook) — R1/R3(parcial via RLS)/R4/R5/R8 já existiam.
**Decisão**: Implementar R2, R6, R9 com heurística de alta precisão (padrão
textual bem restrito, poucas formas de dar falso positivo). Implementar R7 de
forma deliberadamente estreita — só o caso mais óbvio (`data: req.body` literal
num write de ORM) — em vez de tentar detectar "toda falta de validação Zod",
que exigiria entender fluxo de dados e teria falso-positivo alto. **Não
implementar R10** (log de ação admin): decidir o que conta como "ação admin" e
provar ausência de log via regex tem falso-positivo alto demais para o padrão
de confiança das outras regras — melhor declarar "não coberto" do que fingir
cobertura fraca. R3 além do que RLS já cobre (checar posse do recurso, não só
autenticação) fica pelo mesmo motivo: precisa de análise de fluxo de dados.
Dogfooding (rodar `npm run checks -- --strict` neste repo) revelou que o
scanner também vasculhava `bin/urion-mcp-server.mjs`, um bundle esbuild de
962KB, gerando achados que apontavam para dependência de terceiro empacotada —
corrigido com um limite de tamanho de arquivo (200KB) no walker, uma correção
genérica (útil para qualquer projeto com bundle solto fora de `dist/`), não
específica deste repo.
**Consequências**:

- Positivas: ruleset R1–R9 real e testado (13 novos testes unitários); tabela
  do roadmap não afirma cobertura que não existe para R10; o limite de tamanho
  de arquivo evita ruído em qualquer projeto escaneado que tenha bundles soltos
  fora de pastas convencionalmente ignoradas.
- Negativas: R10 continua sem detector — se alguém precisar dessa regra,
  precisa de uma abordagem diferente (ex.: exigir uma anotação/convenção no
  código, não inferência via regex).
  **Alternativas consideradas**:
- Implementar as 10 regras a qualquer custo para "fechar a tabela" — rejeitada:
  contradiz o próprio aviso de risco da Fase 2 ("falso positivo alto se
  heurística for fraca") e o Dogma Zero.

### 2026-09-18 — Corrigir vazamento de processo no CodeSandboxRunner (falso verde real)

**Status**: Aceita
**Contexto**: Ao corrigir os 3 achados `ERROR_SWALLOWED` da sessão anterior
(2 em `bin/create-vibe-safeguard.js`, 1 em `bin/lib/mode-maker.cjs`), rodar
`npm run test:unit` repetidamente revelou que a máquina estava cada vez mais
lenta — uma execução chegou a levar 153s (normal: ~4s), com "transform" de
532s. Investigação encontrou **12 processos `node -e "while(true){}"`**
rodando havia horas, consumindo CPU sem parar. Origem: o teste
`code-sandbox.test.ts` ("deve interromper comandos que excedem o timeout
limite") roda exatamente esse comando via `CodeSandboxRunner.runIsolated` com
timeout de 500ms — e o teste **passava**, reportando `timedOut: true`
corretamente. Só que no Windows, `child_process.exec()` roda o comando dentro
de um `cmd.exe`; o `timeout` nativo do Node mata só esse `cmd.exe` (o filho
direto) — o processo `node` real (neto) fica órfão e continua rodando pra
sempre. Um teste verde escondendo um recurso que nunca foi limpo — exatamente
o tipo de "falso verde" que o Dogma Zero existe para matar, só que desta vez
não no scanner do produto, no próprio motor de sandbox do repo.
**Decisão**: `CodeSandboxRunner` passou a gerenciar o timeout manualmente no
Windows (sem usar a opção `timeout` do `exec`) e mata a árvore inteira via
`taskkill /pid <pid> /T /F` **enquanto o `cmd.exe` ainda está vivo** — só
assim o Windows consegue enumerar e matar o processo neto também (depois que
o `cmd.exe` já morreu, `taskkill /T` não acha mais os filhos dele). No POSIX
o timeout nativo do Node continua sendo usado sem alteração (lá o shell
tipicamente faz exec-replace num comando simples, então matar o filho direto
já mata o processo real — o bug é específico do Windows).
**Consequências**:

- Positivas: o teste que afirma "interrompe o comando" agora interrompe de
  verdade — nenhum processo sobrevive ao timeout (validado rodando a suíte 3x
  seguidas e conferindo a lista de processos após cada rodada). Efeito
  colateral bom: a máquina de desenvolvimento para de degradar ao longo de
  uma sessão longa de testes.
- Negativas: comportamento agora bifurcado por plataforma (Windows vs POSIX)
  dentro da mesma função — mais um `if` para manter, mas necessário porque as
  duas plataformas têm semânticas de processo genuinamente diferentes aqui.
  **Alternativas consideradas**:
- Adicionar a dependência `tree-kill` (biblioteca madura para esse problema
  exato) — plausível e mais testado que uma chamada direta a `taskkill`, mas
  rejeitado por ora para não adicionar uma dependência nova numa correção
  pontual; revisitar se mais casos de kill-de-árvore aparecerem no projeto.
- Ignorar o achado por ser "só o ambiente de dev, não afeta produção" —
  rejeitada: o mesmo padrão (`exec` com timeout) poderia vazar processos reais
  em produção se reaproveitado para rodar comandos de usuário sob timeout, e
  a suíte de testes rodando em CI/Windows de outros contribuidores sofreria o
  mesmo problema.

### 2026-09-19 — Ratchet de cobertura sobe de 67/75 para 84/90/85

**Status**: Aceita
**Contexto**: O ratchet de 2026-09-17 (67% linhas) era um piso honesto, não uma vitória. A meta declarada (80%) exigia testes reais, não ajuste de número.
**Decisão**: Escrever testes para os módulos com 0% de cobertura (DomainEventBus, envSchema, health checks com Prisma/Redis mockados, controllers de blueprint-hub/security-audit/spec-manager/project-health, DTOs, erros de domínio, regras de pontuação de ProjectHealth) e subir o piso do `vitest.config.ts` para 84% linhas/statements, 90% funções, 85% branches (medido: 84,49/91,81/85,77).
**Consequências**: meta de 80% atingida e protegida pelo CI. Fora do cálculo continuam (por decisão anterior) `src/app/**` e `src/**/infrastructure/**`, cobertos só por testes de integração — a cobertura unitária reportada não inclui esses adapters.
**Alternativas consideradas**: manter o piso baixo — rejeitada, deixaria a meta declarada sem verificação.

### 2026-09-19 — Detector de N+1 por heurística textual, só leituras

**Status**: Aceita
**Contexto**: O AGENTS.md proíbe queries N+1 e o roadmap 3.2 pedia uma heurística/teste que as sinalizasse.
**Decisão**: `detect-n-plus-one.ts` (puro, mesmo padrão dos demais detectores): localiza loops, extrai o corpo por balanceamento de delimitadores e sinaliza leituras de banco dentro dele. Só leituras — escrita em loop é outro problema. Severidade WARNING; opt-out explícito `// N+1-OK: motivo`.
**Consequências**: pega o caso clássico (`for` + `findUnique`, `Promise.all(ids.map(...))`). Não pega N+1 indireto (helper que consulta o banco chamado no loop) — precisaria de análise entre arquivos; declarado como limite, não escondido.
**Alternativas consideradas**: AST completo (TypeScript Compiler API) — rejeitada por ora: o `urion-checks` roda em qualquer projeto JS/TS de terceiros como bundle sem dependências; um teste de integração contando queries reais foi mantido como complemento futuro, não como substituto.

### 2026-09-19 — Gate de spec como tool MCP consultiva (roadmap 3.3)

**Status**: Aceita
**Contexto**: O SDLC do projeto exige spec antes de código, mas nada impedia a IA de pular a fase ESPECIFICAR.
**Decisão**: Tool `urion_spec_gate` no servidor MCP. Lógica pura em `spec-manager/application/check-spec-gate.ts`, I/O separado em `infrastructure/spec-candidates-reader.ts` (só lê `.md` de pastas de spec, profundidade ≤ 3, arquivos ≤ 500KB). Estados `SPEC_OK` / `NEEDS_SPEC` / `INCOMPLETE_SPEC`; os dois últimos instruem explicitamente a NÃO implementar.
**Consequências**: a IA passa a ter um ponto de consulta objetivo antes de codar. É consultivo — nenhum MCP bloqueia o editor; o bloqueio real vem dos gates de pre-commit/CI (e do gate de launch, 3.4).
**Alternativas consideradas**: exigir campo "status: aprovada" na spec — rejeitada por ora (o formato de status varia entre projetos e forçaria uma convenção que o público não-técnico não tem); pode virar opção depois.

### 2026-09-19 — Gate de launch e Auditor: validar por código o que é verificável, declarar o resto (roadmap 3.4/3.5)

**Status**: Aceita
**Contexto**: A doutrina promete "não lançar sem spec, testes e revisão", mas nada checava. Um auditor de IA em contexto limpo é mais uma convenção que um mecanismo.
**Decisão**: (1) Gate de launch puro em `shared/domain` com coleta de fatos em `src/mcp` (camada de entrada pode compor features; features não se importam). Grade A exige SPEC + TESTS(cobertura real) + SECURITY + REVIEW; sem meio-termo. (2) Auditor: o **relatório** é validado por código (evidência obrigatória; APPROVED com CRITICAL/HIGH aberto é bloqueado; mais recente vence; contexto compartilhado não conta). O **subagente** é prompt + definição de agente. `.urion/audit/` passou a ser versionável (`.urion/*` + `!.urion/audit/` no `.gitignore`) para a evidência entrar no repositório/CI.
**Consequências**: o gate reprova este próprio repo hoje (specs com critérios em aberto, sem auditoria) — dogfooding honesto, não bug. Independência do auditor continua sendo declaração, não prova; forjar relatório é possível para quem tem acesso ao repo.
**Alternativas consideradas**: verificar `reviewedCommit == HEAD` — rejeitada por ora (invalida a auditoria a cada commit; a idade máxima de 14 dias é o compromisso); auditoria server-side/assinada — fica no backlog do roadmap.

### 2026-09-23 — Release 2.1.0: bump minor + fix do `prepublishOnly`; empacotamento npm inchado fica como dívida declarada

**Status**: Aceita
**Contexto**: `package.json` estava em `2.0.3` (tag já usada no CHANGELOG para outra entrega, 2026-08-08) enquanto um bloco `[Unreleased]` inteiro (Fase 3: spec gate, launch gate, novos detectores, cobertura real, fix do sandbox) esperava versão. Publicar como `2.0.3` seria uma metadado enganoso. Também achei que `prepublishOnly` rodava só `build:mcp`/`build:checks`, sem `tsc` — ou seja, um publish sem `npm run build` manual antes publicaria `dist/` desatualizado ou ausente (o `main` do pacote). Por sorte `dist/` já estava atualizado nesta sessão (verificado via `npm pack --dry-run`), então não houve publish quebrado — mas o script continuaria sendo uma armadilha para o próximo release.
**Decisão**: (1) Bump para `2.1.0` (minor, SemVer — funcionalidade nova retrocompatível) e `[Unreleased]` → `[2.1.0] — 2026-09-23` no CHANGELOG. (2) `prepublishOnly` passa a incluir `tsc`. (3) **Não** mexi no empacotamento em si: `npm pack --dry-run` mostra 723 arquivos / 4,5MB no tarball, incluindo `web/` (landing page inteira, `logo.png` de 598KB), `*.test.ts`, `tools/vscode-extension/` — nada disso é lido em runtime por nenhum `bin/*` (confirmei via grep: zero uso de `__dirname`/`import.meta.url` para caminhos de pacote em `bin/` e `src/`), mas cortar via `files`/`.npmignore` sem testar instalação isolada (pack → extract → `npm install` → rodar cada comando `bin/*`) tem risco real de quebrar `postinstall: prisma generate` (que precisa de `prisma/schema.prisma`) ou o scaffolding do `create-vibe-safeguard.js`. Isso já era assim na `2.0.0` publicada (467 arquivos/2.9MB) — não é regressão desta versão.
**Consequências**: `2.1.0` published é honesto (versão reflete o conteúdo) e à prova de "publish com dist velho". O pacote continua maior do que precisa — quem instala baixa ~4.5MB de coisa que não usa. Ninguém quebra por isso, é só desperdício de banda/disco.
**Alternativas consideradas**: cortar o empacotamento agora, na mesma sessão — rejeitada; risco de regressão silenciosa não testada não vale a pressa de um publish que já estava atrasado.
**Follow-up necessário**: allowlist `files` no `package.json` restrita a `dist/**`, `bin/**`, `prisma/schema.prisma` (+ migrations se existirem) — validada com instalação isolada de verdade antes do próximo publish.

**Atualização (mesmo dia, ainda 2026-09-23)**: o follow-up foi feito nesta mesma sessão, não adiado. Motivo da mudança de plano: a primeira tentativa de `npm publish` falhou por `EOTP` (faltou OTP) antes de completar — nada foi publicado, o que abriu uma janela livre para corrigir antes de tentar de novo. Nessa janela, o `npm pack --dry-run` revelou algo pior que "banda desperdiçada": o tarball incluía `.claude/settings.local.json` e `.claude/scheduled_tasks.lock` (lock de sessão desta própria conversa, com `sessionId`/`pid`) — lixo de sessão de dev vazando para um pacote público, não só peso morto. Isso justificou agir imediatamente em vez de adiar. Adicionado `"files": ["dist", "bin", "prisma/schema.prisma", "CHANGELOG.md"]` ao `package.json` (README/LICENSE são incluídos automaticamente pelo npm). Validado com instalação isolada real (`npm pack` → `npm install ./tgz` num diretório limpo fora do repo): `postinstall` (`prisma generate`) passou, `urion-checks`, `urion-safeguard` (menu interativo) e `urion-mcp-server` (lista as 4 tools MCP corretas) rodaram sem erro, e `require.resolve('urion-safeguard')` resolveu `dist/app/server.js`. Resultado: 723 → 407 arquivos, 4,5MB → 1,5MB (unpacked), 2,7MB → 314KB (tarball). `bin/create-vibe-safeguard.js` e `bin/cli.js` seguem no pacote (fazem parte de `bin/**`) mas continuam sem alias em `"bin"` no `package.json` — não são invocáveis via `npx` hoje; isso é uma questão de produto (feature desligada/incompleta), não de empacotamento, e fica fora do escopo desta correção.

### 2026-09-23 — O produto é a ferramenta CLI/MCP; o template SaaS vira referência não publicada (3.0.0)

**Status**: Aceita
**Contexto**: Uma avaliação honesta do projeto apontou uma crise de identidade: o mesmo repositório e o mesmo `package.json` serviam ao template SaaS (Express, Prisma, Redis, BullMQ) e à ferramenta de governança. Quem instalava o pacote baixava 17 dependências que o CLI/MCP nunca usa (os três executáveis já são bundles esbuild autocontidos, só com módulos nativos do Node), o `main` apontava para um servidor de demonstração e o `postinstall` rodava `prisma generate`. Ao investigar, apareceu também um problema de privacidade: `blueprint` enviava dados para `api.urion.dev` sem consentimento e imprimia afirmações não verificadas (ver CHANGELOG 3.0.0).
**Decisão**: (1) O produto é a ferramenta (CLI + MCP + gates). (2) O pacote npm é gerado por `scripts/build-npm-package.mjs` com manifesto próprio (zero dependências) e a raiz é `private`, para ninguém publicar o template por engano. (3) `blueprint` fica 100% local. (4) O script de build reprova o pacote se algum arquivo importar dependência que não viaja com ele ou usar API de rede (fora do bundle do MCP, cujo SDK embute transports HTTP não usados). (5) Versão major (3.0.0), porque saem `main`, `dist` e o `bin/create-vibe-safeguard.js` do pacote.
**Consequências**: instalação 1 pacote/1 s (antes 230/25 s); o template continua funcionando na raiz (o `Dockerfile` usa `npm ci --only=production` e depende das `dependencies` atuais, por isso não foi possível esvaziá-las no mesmo `package.json`). O pacote agora depende de um passo de build extra (`npm run publish:tool`).
**Alternativas consideradas**: monorepo com workspaces (`packages/cli`) — é o destino natural, mas mover `bin/` e `src/mcp` quebra testes, CI, smoke tests e `cursor-doctor` de uma vez; adiado até o produto estar validado. Separar o template em outro repositório — idem.
**Dívidas conhecidas e NÃO resolvidas aqui**: (a) `bin/create-vibe-safeguard.js` (fora do pacote, mas no repositório) guarda um token do GitHub em texto puro em `~/.urion/config.json` e o embute numa URL de clone dentro de `execSync` com string interpolada (o token pode aparecer em erros/lista de processos); publica em `github.com/urion/cases`, organização que não sabemos se controlamos. Precisa de reescrita ou remoção antes de ser reexposto. (b) O `blueprint` do template (`src/features/blueprint-hub`) ainda existe como API de exemplo; não é chamado pelo CLI. (c) Validação em repositórios reais e medição de precisão/recall dos detectores continuam pendentes (passos 2-4 do plano).

### 2026-09-24 — Medir antes de melhorar: benchmark dos detectores como linha de base

**Status**: Aceita
**Contexto**: A pergunta "o projeto ajuda a resolver problemas reais?" não tinha resposta em números. A detecção é por regex/heurística e nunca havia sido medida contra código vulnerável/seguro conhecido.
**Decisão**: (1) Criar `benchmarks/` com um corpus sintético (195 casos, 13 regras, cada caso com `why`) e um executor que roda os **dois motores reais** (a função `scanProject` extraída do `mode-maker.cjs`, e `runConfigGate`), reportando recall/precisão com IC de Wilson. (2) Congelar os números **antes** de qualquer correção de detector: correções entram depois, com o ganho medido contra esta linha de base (não por palpite). (3) Trocar a mensagem do `vibeguard` que afirmava "seguro e pronto para o ar" por uma que não promete o que a medição não sustenta.
**Consequências**: `RESULTS.md` é a fonte dos números que podemos citar. O corpus foi escrito por quem conhece os detectores, então os números são **otimistas**; eles achavam defeitos concretos (ver "Known issues" no CHANGELOG) e servem de detector de regressão, não de estimativa em projetos reais. A revisão do próprio gabarito já pegou 3 erros meus (casos que legitimamente disparavam outra regra).
**Alternativas consideradas**: medir só em repositórios reais — necessário, mas exige rotulagem manual e cuidado ético (não publicar vulnerabilidades de terceiros); é o passo seguinte, não substituto. Copiar as regexes no medidor — rejeitado (mediria uma cópia, não o produto).
**Limites conhecidos do medidor**: granularidade por caso (não por linha); não cobre o MCP `urion_security_check` (que devolve `APPROVED` quando nada é achado — mesmo problema de promessa da mensagem do CLI, ainda a tratar), nem `launch:gate`, nem o auditor.

### [DATA] — [Próxima decisão]

[Adicione novas decisões táticas aqui conforme o projeto evolui. Para decisões
arquiteturais, crie um ADR em `docs/adrs/` e apenas linke na tabela acima.]
