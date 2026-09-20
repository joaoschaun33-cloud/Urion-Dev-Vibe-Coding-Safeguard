# Quando usar vibe coding — e quando NÃO usar sozinho

> Roadmap 4.4. Guia honesto: o Urion **reduz risco**, não o elimina. Onde o erro custa dinheiro
> alheio, dados de terceiros ou a lei, a resposta correta é **revisão profissional antes do ar**.
> Base: `docs/research/aprendizados-workflow-docs.md` (seção "Quando evitar") e os postmortems
> em `docs/01-product/posicionamento-estrategia.md`. Nível de certeza: MÉDIA (julgamento de
> risco fundamentado em casos públicos, não em medição própria).

## Regra de bolso

Pergunte: **"se isto der errado, quem paga?"**

- **Só eu, e é barato de refazer** → vibe coding com os gates do Urion está ótimo.
- **Meus usuários, com dinheiro ou dados pessoais** → vibe coding para _construir_, mas
  **profissional revisa antes de lançar** (não substitui, complementa).
- **Terceiros, a lei ou vidas** → não vibe-code sozinho.

## Tabela de viabilidade

| Cenário                                                    | Vibe coding sozinho? | Por quê                                                          | O que o Urion cobre hoje                                                                                | O que o Urion NÃO cobre                                                                                  |
| ---------------------------------------------------------- | -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Protótipo, landing page, ferramenta interna sem dados      | ✅ Sim               | Baixo custo de erro                                              | Segredos hardcoded, `.env` versionado, XSS básico                                                       | —                                                                                                        |
| App com login e CRUD (dados de baixo risco)                | 🟡 Com os gates      | Erro comum: rota sem auth, banco aberto                          | `ROUTE_NO_AUTH`, `RLS_MISSING` (SQL/Supabase), `USERID_FROM_CLIENT`, `.env`, N+1, spec/launch gate      | Regras de negócio, autorização por recurso (só RLS), Firebase                                            |
| **Pagamentos** (checkout, assinatura, webhooks)            | ⛔ Não sem revisão   | Dinheiro real; webhook forjado = "pagamento aprovado" falso      | `WEBHOOK_UNVERIFIED` (heurística: rota de webhook de pagamento sem verificação de assinatura), segredos | Idempotência, conciliação, reembolso, PCI-DSS, fraude                                                    |
| **Multi-tenancy** (vários clientes no mesmo sistema)       | ⛔ Não sem revisão   | Vazamento entre clientes é o pior caso; erro sutil de isolamento | `RLS_MISSING` (tabela sem RLS)                                                                          | Isolamento por tenant nas queries, políticas de RLS **corretas** (só detecta ausência), autorização (R3) |
| **Tempo real multiusuário** (chat, colaboração, jogos)     | ⛔ Não sem revisão   | Concorrência e consistência são difíceis de acertar por prompt   | Nada específico                                                                                         | Condições de corrida, ordenação, escala                                                                  |
| **Dados sensíveis / compliance** (LGPD, HIPAA, financeiro) | ⛔ Não sem revisão   | Obrigação legal; multa e dano ao titular                         | Segredos, `.env`, RLS ausente, rota sem auth                                                            | **Não certifica compliance**; consentimento, retenção, criptografia, logs de acesso (R10 não coberto)    |
| **Sistemas críticos** (saúde, infraestrutura, segurança)   | ⛔ Não               | Falha coloca vidas/operações em risco                            | —                                                                                                       | Tudo que importa aqui exige engenharia formal e auditoria                                                |

Legenda: ✅ ok · 🟡 ok com gates e cuidado · ⛔ exige revisão profissional antes do ar.

## O que os gates do Urion garantem (e o que não)

| Gate                                              | Garante                                                            | Não garante                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `urion_spec_gate` (MCP)                           | Existe spec com critérios de aceite antes de codar                 | Que a spec está certa ou aprovada pelo PO                                              |
| `urion-checks` (pre-commit/CI)                    | Ausência dos padrões inseguros que ele sabe detectar               | Ausência de todas as falhas — é heurística por texto, com falso positivo/negativo      |
| `npm run launch:gate` / `urion_launch_gate`       | Spec concluída + cobertura **real** ≥ 80% + 0 críticos + auditoria | Que o app está seguro; os fatos vêm de arquivos locais (forjáveis por quem tem acesso) |
| Auditor em contexto fresco (`prompts/auditor.md`) | Revisão registrada, com evidência por achado                       | Que o contexto foi realmente limpo/modelo diferente (é declaração do auditor)          |

**Nada disso substitui um profissional revisando o código antes do lançamento** — é a frase que mais
aparece nos casos de sucesso de apps vibe-coded, e o motivo de o Urion existir: _forçar_ essa
revisão a acontecer, não fingir que ela já aconteceu.

## Checklist rápido antes de subir

1. Este app cai em alguma linha ⛔ da tabela? Se sim, contrate/peça revisão profissional **antes**.
2. `npm run checks -- --strict` sem críticos.
3. Testes rodando com cobertura (`--coverage`) e o número real ≥ 80%.
4. Spec com critérios de aceite marcados como concluídos.
5. Auditoria independente registrada (`.urion/audit/`) e `npm run audit:validate` aprovado.
6. `npm run launch:gate` → Grade A. Se não for, o gate diz exatamente o que falta.
