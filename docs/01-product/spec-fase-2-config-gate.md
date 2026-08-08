# Feature Spec — Fase 2: Gate de Configuração + Ruleset R1–R10

> Segue `docs/00-context/feature-spec.md`. SDLC (`docs/sdlc.md`).
> **STATUS: D1–D4 APROVADAS pelo PO (2026-08-05). ESPECIFICAR + PLANEJAR (2A) neste
> doc. Próximo: IMPLEMENTAR 2A (aguarda "pode implementar"). 2B (R1–R10) terá plano próprio.**
> Ref.: `docs/01-product/roadmap.md` (Fase 2), `docs/research/aprendizados-workflow-docs.md`
> (R1–R10, scripts de guardrail), `docs/research/dogfooding-urion.md`.
> Nível de certeza: ALTA no problema/valor; MÉDIA nas heurísticas (risco de falso
> positivo — a validar) e no alcance de plataformas.

---

## 🎯 Feature: cobrir a dor real (config de plataforma) + regras de segurança R1–R10

### Contexto

O que derruba apps vibe-coded na vida real não é padrão de texto — é **configuração
de plataforma**: RLS ausente no Supabase (170+ apps Lovable com banco exposto),
endpoints sem auth (Base44), `.env`/segredos versionados, e as regras de segurança
que a doutrina promete mas ninguém automatiza (R1–R10). A Fase 2 leva o Urion do
"scanner de 5 regex" para um **gate que checa o que importa**, entregue onde bloqueia
de verdade (pre-commit/CI) e consumível por IA (MCP estruturado).

Restrições: manter **fonte única** de regras (Fase 0.4); zero overclaim (declarar
heurística e limites); não prometer bloqueio que não existe.

---

## Escopo (4 blocos aprovados pelo PO)

### Bloco A — Gate de configuração (a dor real)

- Detectar tabelas Supabase sem RLS (migrations SQL: `create table` sem
  `enable row level security` / `create policy` correspondente).
- Detectar endpoints sensíveis sem middleware de auth (rota sem auth e sem
  marcação `// PUBLIC:`), estilo `check-auth.js` dos docs.
- Detectar `.env*` fora do `.gitignore` e segredos reais versionados.

### Bloco B — Ruleset R1–R10

- Implementar as 10 regras obrigatórias (auth em toda rota, `userId` do token,
  authz≠auth, sem secrets hardcoded, `.env` no gitignore, não engolir erro,
  validação Zod, rate limiting, verificação de webhook, log de admin) — cada uma
  com detecção + teste. (Fonte: `aprendizados-workflow-docs.md`.)

### Bloco C — Retorno estruturado do MCP

- `urion_security_check` passa a retornar `structuredContent` (via `outputSchema`)
  com `{ status, score, findings[], remediations[] }` **junto** com o texto amigável.

### Bloco D — Precisão do detector de secrets

- Ampliar cobertura (ex.: `sk-proj-`, `ghp_`, chaves de provedores populares).
- Reduzir falso positivo: **ignorar fixtures/testes** (`*.test.*`, `*.spec.*`,
  `__mocks__/`, `fixtures/`, valores `mock*`/`exemplo`/`fake`) — lembrando do nosso
  próprio push barrado por um fixture.

---

## ❓ DECISÕES que precisam da sua aprovação

**D1 — Fatiar a Fase 2 em 2A e 2B** (dogma "passos curtos e verificáveis").
_Proposta (recomendada):_

- **2A** = Bloco D (precisão de secrets) + Bloco A (config gate) + Bloco C (MCP
  estruturado) — entrega valor de dor real rápido.
- **2B** = Bloco B (R1–R10 completo).

**D2 — Alcance de plataforma/stack no primeiro corte.**
_Proposta (recomendada):_ Supabase (RLS via SQL) + Express/Node (rotas/auth) +
`.gitignore`/repo. Firebase, Prisma-policies, outros frameworks: fase posterior.
Motivo: é o stack dominante dos casos reais.

**D3 — Detecção de secrets: regex ampliada + ignore de fixtures agora; biblioteca
madura depois.** _Proposta (recomendada):_ sim — evoluir o regex/allowlist da fonte
única e adicionar ignore de fixtures; avaliar encapsular um motor (ex.: gitleaks)
como item futuro, sem bloquear a Fase 2.

**D4 — Onde o gate vive.** _Proposta (recomendada):_ lógica em `domain/application`
(fonte única, testável), exposta em **CLI** (`check-rls`, `check-auth`,
`check-secrets`) para rodar em **pre-commit/CI** (onde bloqueia de verdade) — e o
código-snippet check também no MCP (Bloco C). Ou seja: config gate = CLI/hooks;
code check = CLI + MCP.

---

## Requisitos / critérios de aceite (por bloco)

- [ ] A (RLS): projeto Supabase com `create table` sem RLS → **flag**; com RLS/policy → ok.
- [ ] A (auth): rota sensível sem middleware e sem `// PUBLIC:` → flag; rota marcada → ok.
- [ ] A (.env): `.env` sem estar no `.gitignore` OU segredo real versionado → flag.
- [ ] D: `sk-proj-...`/`ghp_...` detectados; fixture em `*.test.*` NÃO gera flag.
- [ ] C: `urion_security_check` retorna `structuredContent` validado por `outputSchema` + texto; sem quebrar clientes que só leem texto.
- [ ] B: cada R1–R10 com detecção + teste (na sub-fase 2B).
- [ ] Fonte única preservada; sem overclaim; heurísticas e limites documentados.

---

## Design Técnico (esboço; detalhado no PLANEJAR)

- **Camadas**: `src/features/security-audit/{domain,application}` (detectores puros),
  `bin/` (comandos CLI + hooks), `src/mcp` (outputSchema), `.husky`/CI (gates).
- **Entidades novas**: detectores de config (RLS/auth/env) como funções puras +
  tipos de finding; `outputSchema` das tools.
- **Reuso**: modelos `check-secrets.js`/`check-auth.js`/`check-rls.sh` dos docs.

---

## Dependências

- [ ] Aprovação do PO (D1–D4).
- [ ] Nenhuma lib nova obrigatória em 2A (gitleaks/semgrep são itens futuros a avaliar).

---

## Critérios de Pronto (Definition of Done)

- [ ] Código seguindo AGENTS.md/`honesty.mdc`; fonte única mantida.
- [ ] Testes unitários (≥80%) por detector + casos de falso positivo/negativo.
- [ ] `tsc`/`eslint`/`smoke`/`cursor-doctor` ok; suíte verde.
- [ ] **Dogfooding**: rodar os novos checks neste repo sem falso positivo indevido
      (ex.: não flaggar nossos próprios fixtures).
- [ ] Docs atualizadas; papel de cada check (advisory vs bloqueio) explícito.
- [ ] Relatório de honestidade + nível de certeza.

---

## Riscos / trade-offs (Dogma Zero)

- **Heurísticas geram falso positivo/negativo** — validar em repos reais; começar
  conservador e documentar limites.
- **RLS/auth dependem de convenção** (nome de middleware, estrutura de migrations) —
  cobrir os padrões comuns e permitir marcação/《opt-out》 explícita comentada.
- **Escopo grande** — mitigado pelo fatiamento 2A/2B (D1).

## Notas para a IA

- Reusar a fonte única de regras; NÃO duplicar. Só ir para PLANEJAR após D1–D4.

---

# PLANEJAR — Sub-fase 2A (Blocos D + A + C)

> Aprovado: 2A = precisão de secrets (D) + config gate (A) + MCP estruturado (C).
> 2B (R1–R10) fica para plano próprio. Alcance: Supabase (RLS SQL) + Express/Node +
> repo/.gitignore.

## Princípios de implementação

- Detectores = **funções puras** em `domain/application` (testáveis, fonte única).
- Config gate rodável via **CLI bundlado** (esbuild, igual ao MCP) → serve `npx` e
  pre-commit/CI. Code-check também no MCP (Bloco C).
- Começar **conservador** (menos falso positivo) + permitir opt-out comentado.

## Arquivos a criar / modificar

| Ação          | Arquivo                                                                                 | O quê                                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRIA          | `src/features/security-audit/domain/findings.ts`                                        | Tipo `Finding` {ruleId, severity, file, line?, message, remediation} + `scoreFromFindings()` (100 −20×critical −5×warning) reutilizável.                                          |
| CRIA          | `src/features/security-audit/domain/scan-filters.ts`                                    | `isTestOrFixturePath(path)` (`*.test.*`, `*.spec.*`, `__mocks__/`, `fixtures/`) + `looksLikeMockValue(v)`.                                                                        |
| MODIFICA      | `src/features/security-audit/domain/vibe-guard-rules.ts`                                | Ampliar SECRET regex (prefixos `sk-proj-`, `ghp_`, `gho_`, `xox[bap]-`, etc.) mantendo fonte única. Regenerar `.cjs` (`sync:rules:guard`).                                        |
| CRIA          | `src/features/security-audit/application/detect-missing-rls.ts`                         | Lê migrations SQL: `create table` sem `enable row level security`/`create policy` → Finding.                                                                                      |
| CRIA          | `src/features/security-audit/application/detect-unprotected-routes.ts`                  | Rotas Express sensíveis sem middleware de auth e sem `// PUBLIC:` → Finding (base: `check-auth.js` dos docs).                                                                     |
| CRIA          | `src/features/security-audit/application/detect-env-leaks.ts`                           | `.env*` fora do `.gitignore` / segredo real versionado → Finding.                                                                                                                 |
| CRIA          | `src/features/security-audit/presentation/checks-cli.ts`                                | Orquestra os 3 detectores num relatório; exit code ≠ 0 se houver CRITICAL. Entry do bundle.                                                                                       |
| MODIFICA      | `package.json`                                                                          | bin `urion-checks` → `bin/urion-checks.mjs`; script `build:checks` (esbuild); incluir no `build`/`prepublishOnly`.                                                                |
| CRIA (gerado) | `bin/urion-checks.mjs`                                                                  | Bundle esbuild (gitignored).                                                                                                                                                      |
| MODIFICA      | `.gitignore`                                                                            | Ignorar `bin/urion-checks.mjs`.                                                                                                                                                   |
| MODIFICA      | `src/features/security-audit/application/scan-vibe-guard.ts` + `bin/lib/mode-maker.cjs` | Pular arquivos de teste/fixture (usa `scan-filters`; no cjs, checagem inline equivalente).                                                                                        |
| MODIFICA      | `src/mcp/tools.ts` + `src/mcp/server.ts`                                                | `urion_security_check`: `outputSchema` (Zod) + `structuredContent` {status, score, findings[], remediations[]} junto com o texto.                                                 |
| MODIFICA      | `.husky/pre-commit`                                                                     | Rodar `urion-checks` (via tsx no dev) como gate local.                                                                                                                            |
| CRIA          | testes unit                                                                             | `findings.test.ts`, `scan-filters.test.ts`, `detect-missing-rls.test.ts`, `detect-unprotected-routes.test.ts`, `detect-env-leaks.test.ts`, e teste do `structuredContent` do MCP. |

## Contratos

```
// domain/findings.ts
type Severity = 'CRITICAL' | 'WARNING' | 'INFO';
interface Finding { ruleId: string; severity: Severity; file: string; line?: number; message: string; remediation: string; }
scoreFromFindings(findings: Finding[]): number; // 0..100

// application detectores (puros; recebem conteudo, nao fazem I/O global)
detectMissingRls(files: Array<{ path: string; content: string }>): Finding[];
detectUnprotectedRoutes(files: Array<{ path: string; content: string }>): Finding[];
detectEnvLeaks(input: { gitignore: string; trackedPaths: string[]; envFiles: Array<{ path: string; content: string }> }): Finding[];

// MCP (Bloco C) — urion_security_check.structuredContent
{ status: 'APPROVED'|'REJECTED'; score: number; findings: Finding[]; remediations: string[]; }
```

Detectores recebem conteúdo já lido (I/O de arquivo fica no CLI/adapter) → puros e testáveis sem tocar disco.

## Plano de testes (casos de borda)

- RLS: `create table` sem RLS → 1 finding; com `enable row level security` → 0;
  tabela em bloco comentado → 0.
- Rotas: `router.post('/admin', handler)` sem auth → finding; com `authMiddleware`
  → 0; com `// PUBLIC:` → 0.
- Env: `.env` ausente do `.gitignore` → finding; `.env` ignorado → 0; segredo real
  em arquivo versionado → finding.
- Secrets (D): `sk-proj-…`, `ghp_…` detectados; fixture `foo.test.ts` com chave →
  **0** (ignorado); valor `mockApiKey` → 0.
- MCP (C): `structuredContent` valida no `outputSchema`; texto continua presente;
  cliente que só lê texto não quebra.
- Dogfooding: rodar `urion-checks` neste repo sem falso positivo indevido.

## Riscos / substituições (Dogma Zero)

- Heurística SQL/rotas cobre padrões comuns; casos exóticos podem escapar — começar
  conservador, documentar e permitir opt-out `// PUBLIC:`.
- 2º bundle (`urion-checks`) segue o padrão do MCP; confirmo execução real na
  implementação.
- `outputSchema` no SDK 1.30 exige `structuredContent` conforme schema — validar que
  não quebra clientes text-only (retornar ambos).

## Ordem sugerida de implementação (2A)

1. `findings.ts` + `scan-filters.ts` (+ testes) — base.
2. Bloco D (regex ampliada + ignore fixtures; regenerar cjs) — rápido, alto valor.
3. Bloco C (MCP estruturado) — reusa `findings`/scoring.
4. Bloco A (detectores RLS/auth/env) + `checks-cli` + bundle + pre-commit.
5. AUTO-REVISAR (gates + dogfooding).

## Certeza

ALTA no desenho/contratos; MÉDIA nas heurísticas (falso positivo/negativo, a calibrar)
e no 2º bundle (confirmo em runtime).
