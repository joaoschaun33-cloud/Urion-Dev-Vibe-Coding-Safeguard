# Urion — Roadmap Priorizado

> Documento vivo. Autor: João Schaun (PO/Arquiteto) + Claude (dev sênior).
> Data-base: 2026-08-03. Precede as specs (SDD) de cada item.
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

## Fase 0 — Credibilidade (AGORA) · maior retorno por esforço

Objetivo: eliminar toda promessa falsa. Isso também conserta o próprio repo (o
dogfooding provou que ele reprova aqui).

| # | Item | Entregável | Pronto quando | Esforço |
| --- | --- | --- | --- | --- |
| 0.1 | Remover/alinhar overclaims | Comando `fix` implementado OU removido do README/CLI; sem promessa órfã | Nenhum texto anuncia algo inexistente | P |
| 0.2 | Corrigir/citar a estatística "92%" | README com número correto + fonte, ou removido | Toda alegação tem fonte verificável | P |
| 0.3 | Matar o "falso verde" | Veredito do scanner reprova quando métrica contradiz (ex.: cobertura < limite) | Não é possível receber "100% blindado" com cobertura 18% | P |
| 0.4 | Fonte única das regras | `VIBE_GUARD_RULES` em 1 arquivo, consumido por CLI/MCP/TS | Zero duplicação; `grep` acha 1 fonte | M |

Marco de saída: rodar as 3 ferramentas neste repo e nenhuma emitir alegação falsa.

---

## Fase 1 — Núcleo: MCP guard real (NÚCLEO DO PRODUTO)

Objetivo: transformar o stub (`src/mcp/urion-mcp-server.ts`, hoje uma classe) num
servidor MCP de verdade, conectável ao Cursor/Claude, aplicando gates na geração.

| # | Item | Entregável | Pronto quando | Esforço |
| --- | --- | --- | --- | --- |
| 1.1 | Servidor MCP real | Transporte stdio + registro de tools via SDK MCP | Cursor conecta e lista as tools | M |
| 1.2 | Tool `urion_security_check` ponta a ponta | Valida trecho antes de aceitar; usa a fonte única (0.4) | IA recebe APPROVED/REJECTED real no editor | M |
| 1.3 | Tool `urion_explain_risk` | Explicação leiga sob demanda | Retorna diagnóstico correto por ruleId | P |
| 1.4 | Guia de instalação em < 5 min | `docs/ide-setup.md` atualizado + `mcp-config.json` de exemplo | Um maker instala sem ajuda | P |

Dependência: 0.4. Marco de saída: um maker instala e vê um gate disparar de verdade.

---

## Fase 2 — Gate de configuração + ruleset R1–R10 (A DOR REAL)

Objetivo: cobrir o que de fato derruba apps vibe-coded (Lovable/Base44/Tea): config
de plataforma e as regras de segurança obrigatórias — não só padrões de texto.
Base: ruleset **R1–R10** e scripts de guardrail dos docs de workflow (ver
`docs/research/aprendizados-workflow-docs.md`).

| # | Item | Entregável | Pronto quando | Esforço |
| --- | --- | --- | --- | --- |
| 2.1 | Check de RLS (Supabase/Firebase) | Detecta tabelas/coleções sem Row Level Security (R3) | Alerta em projeto com RLS ausente | G |
| 2.2 | Check de endpoints sem auth (R1/R2) | Rotas sensíveis sem middleware; `userId` vindo do frontend; rota pública sem `// PUBLIC:` | Flag em rota indevida | M |
| 2.3 | Check de `.env`/segredos versionados (R4/R5) | `.env` no git / segredos hardcoded | Bloqueia commit de segredo | P |
| 2.4 | Expandir ruleset para R1–R10 | Regras: autz≠auth, não engolir erro, validação Zod, rate limit, verificação de webhook, log admin | Cada regra tem detecção + teste | G |
| 2.5 | Scripts de guardrail (hooks) | Portar `check-secrets`, `check-auth` (e RLS) como hooks pre-commit/PostToolUse | Hook bloqueia de verdade | M |

Dependência: Fase 1. Risco: falso positivo alto se heurística for fraca — validar.
Verificar antes de depender: mecanismo `.cursor/hooks.json` e ferramentas citadas
nos docs (`vibescanner`, `finehq/vibe-coding-checklist`) — não assumir que existem.

---

## Fase 3 — Rigor e processo

Objetivo: fechar os gates que a doutrina promete mas ninguém automatiza.

| # | Item | Entregável | Pronto quando | Esforço |
| --- | --- | --- | --- | --- |
| 3.1 | Coverage real | Substituir proxy `testFiles/codeFiles` por coverage do vitest | Score usa cobertura medida | P |
| 3.2 | Auditoria de N+1 | Teste/heurística que sinaliza N+1 em repositórios | Flag em caso conhecido de N+1 | G |
| 3.3 | Gate de spec | Recusa gerar feature sem spec associada (via MCP) | IA pede spec antes de codar | M |
| 3.4 | Gate de "pronto para launch" | Checklist que só libera com spec + testes + revisão | "Grade A" só sai com os 3 itens | M |
| 3.5 | Auditor em contexto fresco | Subagente Auditor (contexto limpo, idealmente outro modelo) revisa o diff por CORRETUDE/segurança, exige evidência | Auditor bloqueia diff inseguro | G |

Dependência: Fases 1–2. Base do 3.3–3.5: workflow multi-agente
Planner → Implementer → Auditor dos docs (ver `docs/research/aprendizados-workflow-docs.md`).

---

## Fase 4 — Validação e distribuição

Objetivo: sair de 1 star / 0 uso comprovado para evidência real.

| # | Item | Entregável | Pronto quando | Esforço |
| --- | --- | --- | --- | --- |
| 4.1 | Teste com 5 makers reais | Sessões observadas: um não-dev entende e age sobre a saída? | 5 relatos coletados | M |
| 4.2 | Telemetria mínima ética | Instalações ativas + gates disparados (opt-in, sem PII) | Métrica de adoção real disponível | M |
| 4.3 | README/site alinhados ao novo posicionamento | Mensagem "revisor antes do launch" consistente | Sem overclaim; foco em prevenção | P |
| 4.4 | Guia "quando usar / quando evitar" | Tabela de viabilidade (evitar: pagamentos, multi-tenancy, dados sensíveis/compliance) | Urion orienta honestamente quando NÃO vibe-codar | P |

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
