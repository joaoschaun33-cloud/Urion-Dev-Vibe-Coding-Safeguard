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

### [DATA] — [Próxima decisão]

[Adicione novas decisões táticas aqui conforme o projeto evolui. Para decisões
arquiteturais, crie um ADR em `docs/adrs/` e apenas linke na tabela acima.]
