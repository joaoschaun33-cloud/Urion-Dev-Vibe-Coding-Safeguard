# Urion — Roadmap Priorizado

> Documento vivo. Autor: João Schaun (PO/Arquiteto) + Claude (dev sênior).
> Data-base: 2026-08-03. Precede as specs (SDD) de cada item.
> **Revisão de status: 2026-09-17** — Fases 0, 1 e a maior parte da Fase 2
> foram verificadas como entregues por leitura direta do código (não apenas do
> `CHANGELOG`/commits). Ver marcação `✅ Entregue` em cada item.
> Referências: `docs/01-product/posicionamento-estrategia.md`,
> `docs/research/dogfooding-urion.md`.
> Nível de certeza: ALTA no diagnóstico/ordem; MÉDIA nas estimativas de esforço
> (são chutes calibrados, não medições — Dogma Zero).

---

## Princípios de priorização

1. **Credibilidade primeiro.** A marca é honestidade; qualquer overclaim ativo é
   dívida crítica. Corrigir vale mais que features novas.
2. **Prevenção > detecção.** Cada item deve empurrar o valor para o momento da
   geração, não para depois do estrago.
3. **Impacto na dor real > cobertura teórica.** Priorizamos o que derrubou apps de
   verdade (config/RLS/auth, revisão ausente) sobre mais regex.
4. **Fonte única.** Nada de lógica duplicada; toda regra/gate tem um dono.
5. **Dogfooding contínuo.** Todo gate novo precisa passar (ou reprovar honestamente)
   quando rodado neste próprio repo.

Legenda de esforço (relativo): **P** ≈ 1–2 dias · **M** ≈ 3–5 dias · **G** ≈ 1–2
semanas · **GG** > 2 semanas. Estimativas NÃO testadas.

---

## Fase 0 — Credibilidade (AGORA) · maior retorno por esforço ✅ Entregue

Objetivo: eliminar toda promessa falsa. Isso também conserta o próprio repo (o
dogfooding provou que ele reprova aqui).

| #   | Item                               | Entregável                                                                     | Pronto quando                                            | Esforço | Status                                                                                                                                       |
| --- | ---------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | Remover/alinhar overclaims         | Comando `fix` implementado OU removido do README/CLI; sem promessa órfã        | Nenhum texto anuncia algo inexistente                    | P       | ✅ (commit `c7b0881`)                                                                                                                        |
| 0.2 | Corrigir/citar a estatística "92%" | README com número correto + fonte, ou removido                                 | Toda alegação tem fonte verificável                      | P       | ✅ (README cita Veracode 2025 com link)                                                                                                      |
| 0.3 | Matar o "falso verde"              | Veredito do scanner reprova quando métrica contradiz (ex.: cobertura < limite) | Não é possível receber "100% blindado" com cobertura 18% | P       | ✅ (commit `9ee24cc`, `src/shared/domain/scanner-verdict.ts`)                                                                                |
| 0.4 | Fonte única das regras             | `VIBE_GUARD_RULES` em 1 arquivo, consumido por CLI/MCP/TS                      | Zero duplicação; `grep` acha 1 fonte                     | M       | ✅ (`src/features/security-audit/domain/vibe-guard-rules.ts` é a única fonte; `scripts/sync-vibe-guard-rules.ts` sincroniza `.cursor/rules`) |

Marco de saída: rodar as 3 ferramentas neste repo e nenhuma emitir alegação falsa. **Atingido.**

---

## Fase 1 — Núcleo: MCP guard real (NÚCLEO DO PRODUTO) ✅ Entregue

~~Objetivo: transformar o stub (`src/mcp/urion-mcp-server.ts`, hoje uma classe) num
servidor MCP de verdade~~ — **feito.** O servidor real vive em
`src/mcp/server.ts` (`createUrionMcpServer`, SDK `@modelcontextprotocol/sdk`) +
`src/mcp/index.ts` (boot via `StdioServerTransport`). A classe antiga
`UrionMcpGuardServer` em `src/mcp/urion-mcp-server.ts` ficou como código morto
(só é referenciada pelo próprio teste dela) — candidata a remoção numa limpeza
futura, não bloqueante.

| #   | Item                                      | Entregável                                                    | Pronto quando                              | Esforço | Status                                                                 |
| --- | ----------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ | ------- | ---------------------------------------------------------------------- |
| 1.1 | Servidor MCP real                         | Transporte stdio + registro de tools via SDK MCP              | Cursor conecta e lista as tools            | M       | ✅ (commit `08cb5a8`)                                                  |
| 1.2 | Tool `urion_security_check` ponta a ponta | Valida trecho antes de aceitar; usa a fonte única (0.4)       | IA recebe APPROVED/REJECTED real no editor | M       | ✅ (commit `ae45478`, retorno estruturado status/score/findings)       |
| 1.3 | Tool `urion_explain_risk`                 | Explicação leiga sob demanda                                  | Retorna diagnóstico correto por ruleId     | P       | ✅ (`src/mcp/server.ts:49-62`)                                         |
| 1.4 | Guia de instalação em < 5 min             | `docs/ide-setup.md` atualizado + `mcp-config.json` de exemplo | Um maker instala sem ajuda                 | P       | ✅ (`docs/ide-setup.md`, seção "Urion VibeGuard MCP Server (< 5 min)") |

Dependência: 0.4. Marco de saída: um maker instala e vê um gate disparar de verdade.
**Nota de honestidade**: validado via cliente MCP oficial por stdio (docs/ide-setup.md
linha 211); confirmação dentro do Cursor/Claude específico por um usuário real ainda
não reportada — ver Fase 4.

---

## Fase 2 — Gate de configuração + ruleset R1–R10 (A DOR REAL) 🟡 Parcial

Objetivo: cobrir o que de fato derruba apps vibe-coded (Lovable/Base44/Tea): config
de plataforma e as regras de segurança obrigatórias — não só padrões de texto.
Base: ruleset **R1–R10** e scripts de guardrail dos docs de workflow (ver
`docs/research/aprendizados-workflow-docs.md`).

| #   | Item                                         | Entregável                                                                                        | Pronto quando                     | Esforço | Status                                                                                                                                                                                                                                                        |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Check de RLS (Supabase/Firebase)             | Detecta tabelas/coleções sem Row Level Security (R3)                                              | Alerta em projeto com RLS ausente | G       | ✅ (`detect-missing-rls.ts`, só cobre SQL/Supabase — Firebase ainda não)                                                                                                                                                                                      |
| 2.2 | Check de endpoints sem auth (R1/R2)          | Rotas sensíveis sem middleware; `userId` vindo do frontend; rota pública sem `// PUBLIC:`         | Flag em rota indevida             | M       | ✅ (`detect-unprotected-routes.ts`)                                                                                                                                                                                                                           |
| 2.3 | Check de `.env`/segredos versionados (R4/R5) | `.env` no git / segredos hardcoded                                                                | Bloqueia commit de segredo        | P       | ✅ (`detect-env-leaks.ts` detecta; agora bloqueia de verdade — ver 2.5)                                                                                                                                                                                       |
| 2.4 | Expandir ruleset para R1–R10                 | Regras: autz≠auth, não engolir erro, validação Zod, rate limit, verificação de webhook, log admin | Cada regra tem detecção + teste   | G       | ❌ Não iniciado — `VIBE_GUARD_RULES` ainda tem 5 regras (SECRETS_HARDCODED, AUTH_CLIENT_SIDE, SQL_INJECTION, XSS_UNSANITIZED, RATE_LIMIT_MISSING) + 3 do config gate (RLS_MISSING, ROUTE_NO_AUTH, ENV_LEAK) = 8, não 10, e faltam autz≠auth/webhook/log admin |
| 2.5 | Scripts de guardrail (hooks)                 | Portar `check-secrets`, `check-auth` (e RLS) como hooks pre-commit/PostToolUse                    | Hook bloqueia de verdade          | M       | ✅ (2026-09-17) — `.husky/pre-commit` agora roda `npm run checks -- --strict` e sai com erro se houver achado CRITICAL; adicionado também como step no `ci.yml` como segunda camada (defesa em profundidade, caso alguém pule o hook local com `--no-verify`) |

Dependência: Fase 1 (satisfeita). Risco: falso positivo alto se heurística for fraca — validar
com uso real (ainda não testado contra projeto de terceiro).
Verificar antes de depender: mecanismo `.cursor/hooks.json` e ferramentas citadas
nos docs (`vibescanner`, `finehq/vibe-coding-checklist`) — não assumir que existem.

---

## Fase 3 — Rigor e processo

Objetivo: fechar os gates que a doutrina promete mas ninguém automatiza.

| #   | Item                         | Entregável                                                                                                         | Pronto quando                   | Esforço | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | Coverage real                | Substituir proxy `testFiles/codeFiles` por coverage do vitest                                                      | Score usa cobertura medida      | P       | 🟡 Parcial (2026-09-17) — `ci.yml` agora roda `npm run test:coverage` de verdade (era só `npm run test`, sem cobertura, apesar do step já se chamar "Coverage Gate" — mais um overclaim corrigido). O limiar em `vitest.config.ts` foi ajustado para um **ratchet honesto** (67% linhas/statements, 76% branches/funções) batendo com a cobertura real medida, em vez do 85%/80% que sempre reprovava e nunca era checado. **O que falta**: (a) `scanner-verdict.ts:24-34` ainda usa a proxy `testFiles/codeFiles` para o _score do produto_ — o ratchet resolveu a auto-checagem do repo, não o scanner que o Urion oferece a terceiros; (b) subir o piso gradualmente até a meta de 80% (AGENTS.md/vision.md) escrevendo testes para os arquivos com 0% hoje (`shared/config/env.ts`, `shared/http/health-check.ts`, `shared/domain/domain-event-bus.ts`, controllers/módulos de wiring). |
| 3.2 | Auditoria de N+1             | Teste/heurística que sinaliza N+1 em repositórios                                                                  | Flag em caso conhecido de N+1   | G       | ❌ Não iniciado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 3.3 | Gate de spec                 | Recusa gerar feature sem spec associada (via MCP)                                                                  | IA pede spec antes de codar     | M       | ❌ Não iniciado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 3.4 | Gate de "pronto para launch" | Checklist que só libera com spec + testes + revisão                                                                | "Grade A" só sai com os 3 itens | M       | ❌ Não iniciado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 3.5 | Auditor em contexto fresco   | Subagente Auditor (contexto limpo, idealmente outro modelo) revisa o diff por CORRETUDE/segurança, exige evidência | Auditor bloqueia diff inseguro  | G       | ❌ Não iniciado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Dependência: Fases 1–2 (satisfeitas). Base do 3.3–3.5: workflow multi-agente
Planner → Implementer → Auditor dos docs (ver `docs/research/aprendizados-workflow-docs.md`).

**Achado novo (2026-09-17):** o item 3.1 é mais urgente do que a ordem original
sugeria. Não é só "trocar uma proxy por uma métrica melhor" — é que o projeto
**já reprovaria hoje** no próprio limiar de qualidade que ele exige de outros
projetos, e ninguém percebe porque o CI não roda `test:coverage`. Sugestão:
adicionar `test:coverage` ao `ci.yml` (ou pelo menos rodar e reportar, sem
quebrar o build ainda) antes de prometer o gate de launch (3.4).

---

## Fase 4 — Validação e distribuição

Objetivo: sair de 1 star / 0 uso comprovado para evidência real.

| #   | Item                                         | Entregável                                                                            | Pronto quando                                    | Esforço |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| 4.1 | Teste com 5 makers reais                     | Sessões observadas: um não-dev entende e age sobre a saída?                           | 5 relatos coletados                              | M       |
| 4.2 | Telemetria mínima ética                      | Instalações ativas + gates disparados (opt-in, sem PII)                               | Métrica de adoção real disponível                | M       |
| 4.3 | README/site alinhados ao novo posicionamento | Mensagem "revisor antes do launch" consistente                                        | Sem overclaim; foco em prevenção                 | P       |
| 4.4 | Guia "quando usar / quando evitar"           | Tabela de viabilidade (evitar: pagamentos, multi-tenancy, dados sensíveis/compliance) | Urion orienta honestamente quando NÃO vibe-codar | P       |

---

## Backlog (DEPOIS / a validar)

- Auto-fix real por regra (só depois de precisão comprovada).
- Extensão VSCode (`tools/vscode-extension/`) como segundo veículo.
- Encapsular motor maduro (ex.: Semgrep) se o scanner virar prioridade competitiva.
- Selo "Urion Verified" com verificação server-side (só quando os gates forem sólidos).

---

## Sequência recomendada (resumo)

`0.1–0.3 (credibilidade) → 0.4 (fonte única) → 1.1–1.4 (MCP real) → 2.x (config) →
3.x (rigor) → 4.x (validação)`.

Racional: Fase 0 é barata e remove a dívida que contradiz a própria marca; Fase 1 é
o veículo escolhido (MCP em tempo real); Fase 2 ataca a dor que dá manchete. As
demais dependem dessas fundações.

**Onde estamos agora (2026-09-17):** Fases 0 e 1 concluídas; Fase 2 com o gate de
configuração funcionando via CLI (`urion-checks`), mas faltando (a) expandir para o
ruleset R1–R10 completo (item 2.4) e (b) ligar o gate ao `.husky/pre-commit` para
virar bloqueio de verdade, não só relatório sob demanda (item 2.5). Próximo passo
recomendado: **2.5 antes de 2.4** — ligar o que já existe ao hook custa menos e
entrega prevenção real imediatamente; expandir o ruleset é valioso mas não bloqueia
nada hoje.

---

## Definição de sucesso (norte)

- Tempo "instalar → primeiro gate útil" < 5 min.
- % de gerações inseguras interceptadas antes do commit.
- Nenhuma ferramenta do Urion emite alegação falsa quando rodada neste repo.
- Adoção medida por instalações ativas, não por estrelas.

---

## Honesty Check (Dogma Zero)

- **Testado em runtime?** O diagnóstico que embasa a ordem foi (auditoria + execução
  real). O roadmap em si é plano, não código testado.
- **Suposições:** estimativas de esforço são chutes; a ordem assume que credibilidade
  > features (plausível dado o posicionamento, não validado com mercado).
- **Certeza:** ALTA na priorização; MÉDIA nos tamanhos e prazos.
