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

### [DATA] — [Próxima decisão]

[Adicione novas decisões táticas aqui conforme o projeto evolui. Para decisões
arquiteturais, crie um ADR em `docs/adrs/` e apenas linke na tabela acima.]
