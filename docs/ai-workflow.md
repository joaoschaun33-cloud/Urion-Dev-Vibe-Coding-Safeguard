# AI Workflow — Catálogo de Ferramentas por Fase

> **Fonte única de verdade** para "qual ferramenta usar em cada fase" do desenvolvimento.
> A IA deve **consultar este mapa antes de agir** — para executar a fase certa com a
> ferramenta certa, sem ficar pesquisando o que fazer do zero.

Este catálogo espelha o SDLC do projeto (ESPECIFICAR → PLANEJAR → IMPLEMENTAR →
AUTO-REVISAR → ENTREGAR RELATÓRIO) e o ciclo tático do vibe coding
(Explorar → Planejar → Implementar → Verificar).

---

## Legenda

- 🌐 **Base (sempre disponível):** faz parte do template e funciona em qualquer clone do
  repositório — Node, Prisma, Zod, Pino, Vitest, ESLint, Prettier, Husky, Git.
- 🤖 **Assistido (ambiente Claude/Cowork):** *skills* e *MCPs* que só existem quando o
  desenvolvimento é feito com Claude/Cowork **e** os plugins correspondentes estão
  instalados. **Não são garantidos num clone genérico.**

> **Regra de honestidade (Dogma Zero):** se uma skill/MCP 🤖 não estiver disponível no
> ambiente, use o *fallback* 🌐 equivalente e **declare a substituição**. Nunca invente
> skills, versões ou comandos que você não confirmou existir.

---

## Como a IA deve usar este catálogo

1. **Identifique a fase atual** da tarefa.
2. **Invoque a skill 🤖 indicada**; se indisponível, use o *fallback* 🌐 e declare.
3. **Nunca pule ESPECIFICAR e PLANEJAR** — o projeto é Spec-Driven (SDD). Código sem
   spec/plano aprovado é violação de processo.
4. **Toda entrega termina com o Checklist de Honestidade** e o nível de certeza
   (ALTA / MÉDIA / BAIXA / INCERTEZA TOTAL).

---

## Núcleo do SDLC (fase → ferramenta)

| Fase | 🤖 Skill recomendada | 🌐 Fallback base | Artefato / Local |
|---|---|---|---|
| Ideação de produto | `product-management:product-brainstorming` (+ `competitive-brief`, `synthesize-research`) | Discussão estruturada + pesquisa manual | `00-context/vision.md` |
| **ESPECIFICAR** (SDD) | `product-management:write-spec`, `doc-coauthoring` | Preencher os templates de contexto | `00-context/prd.md`, `00-context/feature-spec.md`, `01-product/*` |
| **PLANEJAR** / Arquitetura | `engineering:architecture` (ADR), `engineering:system-design` | ADR manual | `decisions-log.md` / ADRs |
| Planejar entrega | `product-management:sprint-planning`, `product-management:roadmap-update` | Editar o roadmap à mão | `ROADMAP.md` |
| **IMPLEMENTAR** | `andrej-karpathy-skills:karpathy-guidelines` + `prompts/feature-implementation.md`; MCP **github** | Seguir `.cursor/rules/*` + Git | `src/features/<feature>/*` (FSD) |
| **AUTO-REVISAR** | `engineering:code-review`, `/security-review`, `codex:review` / `codex:adversarial-review` (2º modelo) | Revisão manual + `npm run lint` | Relatório de revisão |
| Testes | `engineering:testing-strategy` | `npm test` (unit+cobertura) + `npm run test:integration:local` | `src/**/*.test.ts`, `*.integration.test.ts` |
| Documentar | `engineering:documentation`, `doc-coauthoring`, `humanizer` | Escrever Markdown à mão | `docs/` |
| **ENTREGAR** / Deploy | `engineering:deploy-checklist`, `engineering:incident-response` | Checklist manual | `docs/` / runbook |

---

## Ferramentas base 🌐 (parte do template)

- **Runtime:** Node `>=20`, npm. Instalação: `npm ci --include=dev`.
  - ⚠️ Se o ambiente tiver `NODE_ENV=production`, o npm omite as devDependencies —
    use `--include=dev` para desenvolver/testar.
- **Aplicação:** Express, Prisma (PostgreSQL), Zod (validação), Pino (logs JSON).
- **Qualidade:** Vitest + cobertura v8, ESLint (flat config, `strict-type-checked`),
  Prettier, Husky + lint-staged.
- **Testes de integração:** `docker compose up -d postgres` **ou**, sem Docker,
  `npm run test:integration:local` (Postgres efêmero em userland).
- **Scripts principais:** `dev`, `build`, `test`, `test:integration:local`,
  `test:integration`, `lint`, `format`, `db:migrate`, `db:generate`, `db:studio`.

---

## Famílias opcionais 🤖 (quando aplicável)

Use apenas quando o projeto tiver a necessidade correspondente:

- **UI / Design:** `design:*` (`design-critique`, `accessibility-review`, `ux-copy`,
  `design-system`), `figma:*` (design-to-code / code-to-design).
- **Dados / Analytics:** `data:*` (`analyze`, `sql-queries`, `build-dashboard`,
  `create-viz`), `product-tracking-skills:*` (instrumentação de telemetria).
- **Marketing / GTM:** `marketing:*` (`campaign-plan`, `content-creation`, `seo-audit`),
  `brand-voice:*`.
- **Entregáveis de documento:** skills de formato `docx`, `pdf`, `pptx`, `xlsx`.

## MCPs úteis 🤖 (exigem conexão/autenticação)

- **github** — código, PRs, issues (fase IMPLEMENTAR / AUTO-REVISAR).
- **linear** / **notion** — gestão de tarefas e documentação de produto.
- **slack** — comunicação de status e incidentes.

> A disponibilidade de MCPs depende de o usuário tê-los conectado. Se não houver conexão,
> a IA deve dizer e seguir com o fluxo base.

---

## Nota de honestidade

Este catálogo lista ferramentas **reais** do ecossistema Claude/Cowork e do stack base do
template. Skills/MCPs marcados com 🤖 **podem não existir** num ambiente específico — nesse
caso, a IA usa o fallback 🌐 e **declara**. Nunca finja que uma skill está disponível.
