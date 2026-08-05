# Aprendizados dos docs de workflow (uploads do PO)

> Síntese de dois PDFs fornecidos pelo PO em 2026-08-04, usados como insumo do
> roadmap. Nível de certeza: ALTA na leitura; MÉDIA sobre existência das ferramentas
> externas citadas (a verificar antes de depender).

## Documentos

- **Doc A — "Workflow Automático, 4 camadas":** memória persistente
  (`CLAUDE.md`/`AGENTS.md`), workflow orquestrado (state machine `vibe-flow.sh` +
  `.vibe-state.json`), guardrails sem humano (hooks Claude Code
  `PostToolUse`/`PreToolUse`, pre-commit, GitHub Action), time de agentes
  (Planner/Builder/Tester/Reviewer).
- **Doc B — "Guia v1.0":** cases reais de sucesso/fracasso, workflow multi-agente
  Planner → Implementer → Auditor, arquivos de instrução permanente, hooks,
  checklist "prática humana → regra de agente", **R1–R10** e tabela "quando evitar".

## Por que importam

Validam a estratégia do Urion: **regras codificadas > intenções memorizadas**,
prevenção via hooks que bloqueiam, spec antes de codar, auditor em contexto fresco,
escopo estreito + revisão nos pontos críticos. Corroboram o **~45%** (Veracode) e o
caso Lovable ("1.645 apps, 170 com dados expostos").

## Ruleset R1–R10 (base da Fase 2)

1. **R1** Auth em toda rota que retorna dados de usuário (exceção com `// PUBLIC:`).
2. **R2** `userId` vem do token JWT validado no backend — nunca do frontend.
3. **R3** Auth ≠ Autorização: validar permissão ao recurso (inclui RLS).
4. **R4** Nunca hardcode secrets — usar `process.env.*`.
5. **R5** `.env*` no `.gitignore` (verificado por hook).
6. **R6** Não engolir erros (sem `catch` vazio/silencioso).
7. **R7** Validação de entrada (Zod/Joi/Yup) em body/query/params.
8. **R8** Rate limiting em login/registro/recuperação.
9. **R9** Verificação de assinatura de webhooks de pagamento.
10. **R10** Logs de ações administrativas (timestamp, userId, ação).

## Scripts de guardrail (modelos p/ Fase 2.5)

- `scripts/check-secrets.js` — varre secrets fora de `process.env`.
- `scripts/check-auth.js` — rota sem auth e sem marcação `// PUBLIC:`.
- `scripts/check-rls.sh` — RLS em migrações Supabase.
- Entregues via pre-commit / `PostToolUse` (Claude Code) — enforcement físico.

## Multi-agente (base da Fase 3.3–3.5)

Planner (read-only, gera plano) → Implementer (um passo/um teste/um commit) →
Auditor (contexto fresco, idealmente outro modelo, exige evidência). Fases:
Exploração → Especificação (SPEC.md aprovado) → Implementação → Auditoria.

## Quando evitar (base da Fase 4.4 / posicionamento)

Evitar vibe coding em produção sem revisão profissional: pagamentos, multi-tenancy,
tempo real multiusuário, dados sensíveis/compliance (LGPD/HIPAA), sistemas críticos.

## A verificar antes de depender (Dogma Zero)

`vibescanner`, `vibe-coding-checklist` (`finehq`), `.cursor/hooks.json` — confirmar
existência/funcionamento. Hooks de Claude Code (`PreToolUse`/`PostToolUse`) são reais.
