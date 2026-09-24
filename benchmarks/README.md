# Benchmark dos detectores

Mede, com números, o quanto os detectores do Urion **acham** (recall) e **acertam** (precisão).
Sem isso, "ajuda a proteger seu app" é só uma hipótese.

```bash
npm run benchmark      # roda o corpus e regenera RESULTS.md e results.json
npx vitest run benchmarks
```

## O que é medido

Os **dois motores reais** que o usuário executa, sem cópia da lógica:

| Motor | Comando                                                                          | Regras                                                                                                                                                       |
| ----- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `npx urion-safeguard vibeguard` (`bin/lib/mode-maker.cjs`, função `scanProject`) | 5 (`SECRETS_HARDCODED`, `AUTH_CLIENT_SIDE`, `SQL_INJECTION`, `XSS_UNSANITIZED`, `RATE_LIMIT_MISSING`)                                                        |
| 2     | `urion-checks` (`runConfigGate`)                                                 | 8 (`RLS_MISSING`, `ROUTE_NO_AUTH`, `ENV_NOT_IGNORED`, `USERID_FROM_CLIENT`, `ERROR_SWALLOWED`, `WEBHOOK_UNVERIFIED`, `BODY_UNVALIDATED_WRITE`, `N_PLUS_ONE`) |

Cada caso do corpus (`fixtures/`) é um mini-projeto gravado num diretório temporário e escaneado pelo
mesmo caminho de código do usuário (mesmos filtros de arquivo e de pasta).

## Limites (leia antes de citar um número)

1. **O corpus é sintético e foi escrito por quem conhece os detectores.** Tende a ser otimista. Ele
   serve para (a) achar defeitos concretos e (b) acompanhar regressão. **Não** é uma estimativa da
   taxa de acerto em projetos reais — isso vem do teste em repositórios reais.
2. **Granularidade por caso**, não por linha: "a regra disparou neste projeto?".
3. **O gabarito é opinião fundamentada.** Cada caso tem um `why`. Se você discorda de um rótulo,
   contesta o caso, não o total.
4. **Poucos casos por regra → intervalos largos.** O relatório mostra o IC 95% de Wilson.
5. Não mede: o servidor MCP (`urion_security_check`, que roda em trechos), o `launch:gate` e o
   auditor independente.

## Como adicionar um caso

1. Escolha `fixtures/vibeguard.ts` ou `fixtures/checks.ts`.
2. Escreva o caso a partir de **código como apps gerados por IA realmente aparecem**, não a partir
   do regex. Inclua também um **negativo parecido** (código seguro que a regra pode acusar).
3. Preencha `why` com a justificativa do rótulo.
4. Segredos falsos: monte por concatenação (`cat('sk_', 'live_', '...')`) para não disparar Gitleaks.
5. Não use caminhos com `fixtures/`, `mocks/`, `__tests__`, `.test.` ou `node_modules/dist/build/web`:
   o scanner os ignora e o caso viraria um falso "perdeu". `corpus.test.ts` reprova isso.
