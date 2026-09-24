# Medição em repositórios reais — resultado (2026-09-24)

> Método, regras éticas e limites em [`PROTOCOL.md`](PROTOCOL.md). **Apenas contagens agregadas**:
> nenhum nome de repositório, caminho ou valor de segredo é publicado.

## Amostra

- **81 repositórios públicos** de projetos com o marcador do Lovable (`lovable-tagger` no
  `package.json`), não fork, não arquivados, 50 KB–30 MB; 2 sem arquivos escaneáveis.
- Amostra **não aleatória** (primeiros 99 resultados de uma busca de código), majoritariamente
  front-end + Supabase. **Não representa "todos os apps vibe-coded".**
- Os dois motores acusaram algo em **39 de 81** repositórios (48%). Após rotulagem manual,
  **21 de 81 (26%) têm pelo menos um achado relevante**.

## Precisão (dos achados, quantos eram relevantes)

"Por repositório" conta cada par (regra, repositório) uma vez, para um único projeto com 20 arquivos
iguais não inflar o resultado.

### Motor 1 — `npx urion-safeguard vibeguard`

| Regra                | Achados | Relevantes | Falsos alarmes | Incertos | Precisão (achados) | Precisão (por repositório) |
| -------------------- | ------: | ---------: | -------------: | -------: | -----------------: | -------------------------: |
| `SECRETS_HARDCODED`  |      30 |         24 |              3 |        3 |                89% |                  60% (3/5) |
| `AUTH_CLIENT_SIDE`   |      12 |         12 |              0 |        0 |               100% |                 100% (6/6) |
| `XSS_UNSANITIZED`    |      20 |          2 |             18 |        0 |            **10%** |              **20% (1/5)** |
| `RATE_LIMIT_MISSING` |       5 |          3 |              2 |        0 |                60% |                  67% (2/3) |
| **Total**            |  **67** |     **41** |         **23** |    **3** |            **64%** |            **63% (12/19)** |

### Motor 2 — `urion-checks`

| Regra                | Achados | Relevantes | Falsos alarmes | Precisão (achados) | Precisão (por repositório) |
| -------------------- | ------: | ---------: | -------------: | -----------------: | -------------------------: |
| `RLS_MISSING`        |      75 |         30 |             45 |                40% |                 73% (8/11) |
| `ERROR_SWALLOWED`    |      57 |         14 |             43 |                25% |                 36% (4/11) |
| `ENV_NOT_IGNORED`    |      23 |          6 |             17 |                26% |                 28% (5/18) |
| `ROUTE_NO_AUTH`      |       6 |          1 |              5 |                17% |                  25% (1/4) |
| `N_PLUS_ONE`         |       5 |          4 |              1 |                80% |                  50% (1/2) |
| `USERID_FROM_CLIENT` |       1 |          0 |              1 |                 0% |                   0% (0/1) |
| **Total**            | **167** |     **55** |        **112** |            **33%** |            **40% (19/47)** |

Comparação com o corpus sintético: a precisão real do `urion-checks` (**33–40%**) ficou bem abaixo da
sintética (85%); a do `vibeguard` (**63–64%**) ficou próxima de 71%, mas com um extremo ruim no XSS.
O corpus sintético **superestimou** a precisão, como esperado.

### Por que os falsos alarmes acontecem (causas medidas)

- **XSS (18 de 20):** 14 são JSON-LD de SEO (`JSON.stringify` de dados do próprio site), 2 são CSS
  estático e 2 são HTML já escapado antes de injetar.
- **RLS (45 de 75):** 33 têm o RLS ativado em **outra migração do mesmo repositório** (o detector
  olha um arquivo por vez) e 12 estão em projetos sem Supabase.
- **ERROR_SWALLOWED (43 de 57):** limpeza de `unsubscribe`, `video.play()`, `localStorage`, código
  gerado (bundle de service worker) e arquivo minificado/ofuscado.
- **.env (17 de 23):** o arquivo tem só variáveis públicas (`VITE_*`), mas o detector não olha o
  conteúdo.
- **Rotas (5 de 6):** middleware de auth com nome que a regra não reconhece (`protect`), auth montada
  em outro arquivo (`app.use(path, authMiddleware, route)`) e a própria rota de login.

## Recall (o que o scanner deixou passar) — estimativas parciais

Não há gabarito completo em código real. Onde existe um verificador independente e mais amplo:

| Categoria                       | Oráculo (independente das regras)                  | Resultado                                                                                                                                                                                                         |
| ------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token/credencial em web storage | grep amplo, depois revisão manual das linhas       | **6 de 11 repositórios** com o problema foram acusados → recall **≤ 55%** (o oráculo pode estar incompleto, então o real tende a ser menor). Perdeu nomes como `access_token`, `authToken` e chaves customizadas. |
| Segredos em `.env` versionado   | leitura dos `.env` sinalizados pelo `urion-checks` | **0 de 6 arquivos** (5 repositórios) com segredo provável foram vistos pelo `vibeguard` → recall **0%**. Causa: o filtro de extensão nunca casa com `.env`.                                                       |

Os `.env` perdidos continham variáveis como `DATABASE_URL`, `JWT_SECRET`, chave de service-role e
chaves de API de terceiros.

## O que isso significa

1. **O achado mais sério é de recall, não de precisão:** o comando principal (`vibeguard`) **não lê
   `.env`**, onde vazam os segredos mais graves da amostra.
2. **O `urion-checks` grita demais:** ~2 em cada 3 alertas não eram relevantes. Isso destrói a
   confiança de quem o usa como gate de commit (`--strict`).
3. **`XSS_UNSANITIZED` está praticamente inutilizável hoje** (10% de precisão) por causa do JSON-LD
   e do defeito de backtracking já registrado.
4. As regras mais úteis na amostra foram `AUTH_CLIENT_SIDE` (12/12) e `N_PLUS_ONE` (4/5) — mas, com
   poucos casos, nenhuma conclusão forte sobre elas.

## Reteste após as correções 1 e 2 (2026-09-24, mesmos 81 repositórios)

Correções: o `vibeguard` passou a ler `.env` (lógica própria, respeitando variáveis públicas) e o
regex de XSS foi refeito (sem o backtracking, sem acusar JSON-LD/CSS/literais estáticos, com
`innerHTML`, `document.write` e `insertAdjacentHTML`). Os achados **novos** foram rotulados à mão,
com o mesmo rubrico.

| Regra                                    | Antes (achados / precisão) | Depois (achados / precisão) | Por repositório: antes → depois |
| ---------------------------------------- | -------------------------- | --------------------------- | ------------------------------- |
| `SECRETS_HARDCODED`                      | 30 / 89%                   | 62 / **95%**                | 60% → **80%** (8/10)            |
| `XSS_UNSANITIZED`                        | 20 / 10%                   | 18 / **71%**                | 20% → **71%** (5/7)             |
| `AUTH_CLIENT_SIDE`, `RATE_LIMIT_MISSING` | inalteradas                | inalteradas                 | —                               |
| **`vibeguard` total**                    | 67 / 64%                   | 97 / **90%**                | 63% → **81%** (21/26)           |

(Precisão exclui os achados "incertos": 8 no total depois; ver rubrico.)

- **`.env`:** o `vibeguard` passou a acusar segredos em 8 arquivos `.env*` versionados, incluindo 2
  `.env.production` que **nem o `urion-checks` sinalizava** (o `.gitignore` deles continha `.env`, que
  o detector trata como se cobrisse `.env.production`, mas o Git continua rastreando o arquivo).
  **Atenção:** o recall de `.env` **não** é mais uma medição independente — o critério de "segredo"
  foi derivado dos mesmos dados; use o 0% anterior só como prova do defeito, não o novo número como
  garantia.
- **XSS:** as regras novas acharam 14 casos (8 com dado interpolado sem escape em HTML injetado numa
  janela de impressão, como nome de cliente ou e-mail de paciente; 4 incertos; 2 falsos).

### Um erro meu, pego pela remedição

Uma primeira versão do regex acusava também `__html:` sozinho numa linha (para pegar objetos JSX
quebrados em várias linhas). Sem ver a linha anterior, ela disparou **70 vezes no `chart.tsx` padrão
do shadcn/ui** (um `<style>` de CSS gerado de constantes, presente em quase todo projeto Lovable). Foi
removida do modo linha; o modo MCP (que vê o trecho inteiro) continua cobrindo o caso. **No corpus
sintético essa alternativa só parecia ganho** (recall de XSS 80%); no código real era 70 falsos
alarmes. É por isso que o corpus sintético não basta como medida.

## Validação em lotes NOVOS (a prova de generalização)

Depois das correções dos itens 1–7 (lote 1), rodamos os mesmos detectores em **dois lotes de
repositórios que nunca tinham visto** (80 e 70 projetos Lovable, achados por outros marcadores:
`vite_react_shadcn_ts` no `package.json` e `lovable.dev/projects` no README). Rotulamos tudo com o
mesmo rubrico. **"Primeiro contato" é a estimativa honesta de como o produto se sai em projetos
novos**; "final" é depois de corrigir as causas que aquele lote revelou (portanto **otimista**,
porque foi calibrado nos mesmos dados).

Precisão (dos achados, quantos eram relevantes; "incertos" fora da conta):

| Lote                                            | `vibeguard` por achado (por repositório) | `urion-checks` por achado (por repositório) |
| ----------------------------------------------- | ---------------------------------------: | ------------------------------------------: |
| 1, linha de base (antes de qualquer correção)   |                                64% (63%) |                                   33% (40%) |
| 1, final (calibrado nele)                       |                                95% (94%) |                                   96% (89%) |
| **2, primeiro contato** (80 repositórios novos) |                            **48% (63%)** |                             77%\* (**60%**) |
| 2, final                                        |                                90% (93%) |                                 99%\* (93%) |
| **3, primeiro contato** (70 repositórios novos) |                            **55% (71%)** |                               **57% (71%)** |
| 3, final                                        |                                95% (91%) |                                 100% (100%) |

\* O lote 2 tem um único repositório grande e duplicado que responde por 120 dos 177
achados do `urion-checks`; por achado o número é inflado, por repositório não.

**Leitura honesta:** em projetos novos, a precisão esperada hoje é de **~55–70%** (a cada 10 alertas,
3 a 4 não valem a pena), não os 90+% dos lotes calibrados. Cada lote novo revelou classes de falso
alarme que os anteriores não tinham, então o número "final" de qualquer lote sempre subestima o
próximo. Os falsos alarmes que sobram nos lotes finais são poucos, mas a lista de causas ainda não
convergiu.

### Falsos alarmes que só apareceram nos lotes novos (e o que foi feito)

| Causa                                                                  | Achados | Correção                                                                                         |
| ---------------------------------------------------------------------- | ------: | ------------------------------------------------------------------------------------------------ |
| Código gerado commitado (`chunk-*.js`, cache `.vite/deps`)             |      15 | ignora pastas ocultas; arquivo "gerado" (linha > 1000 caracteres) só é varrido para **segredos** |
| Template de várias linhas sem `${}` (GTM, CSS, widget)                 |       8 | o scanner olha o corpo do template; com `${dado}` continua acusando                              |
| `script.innerHTML = JSON.stringify(cfg)` (widgets TradingView)         |       8 | `JSON.stringify` aceito em atribuição a `innerHTML`                                              |
| Chave pública do Firebase Web (`apiKey` com `authDomain` ao lado)      |       5 | reconhece o objeto de configuração                                                               |
| Script de migração (BEGIN/COMMIT/INSERT em laço) e scripts avulsos     |  10 + 5 | ignora `scripts/`, `migrations/`; query literal de escrita não é N+1                             |
| Rota de admin com `adminAuth` (`userId` no corpo)                      |       2 | reconhece o guard na definição da rota                                                           |
| RLS gerado por `EXECUTE format(...)` e a palavra `as` lida como tabela |       9 | não acusa RLS dinâmico; palavra reservada não é tabela                                           |
| Limitador global (`app.use('/api', limiter)`)                          |       4 | suprime o alerta de rate limit se há limitador global                                            |
| `ERROR_SWALLOWED` em áudio, limpeza de store, laço de tentativas       |  6 de 7 | só acusa quando há **evidência de I/O** (rede, banco, pagamento)                                 |

**Custo de recall assumido:** a exigência de evidência de I/O em `ERROR_SWALLOWED` também removeu
~9 achados que eu tinha rotulado como relevantes (por exemplo `fetchAuthor(...)` dentro de um
`Promise.all`, que a lista de palavras não reconhece). É uma regra de baixa confiança por natureza
(severidade `WARNING`, nunca bloqueia commit); preferimos poucos alertas com precisão razoável.
Idem para XSS: um template de várias linhas cujo `${}` só aparece muitas linhas depois continua
acusado, mas um XSS multilinha que o CLI (modo linha) não vê na primeira linha é perdido.

### Recall em dados nunca vistos (oráculo independente, só para autenticação no navegador)

Grep amplo e independente das regras, com revisão manual das linhas, comparado ao scanner:

| Momento                                                         | Repositórios com o problema real | Acusados pelo scanner |
| --------------------------------------------------------------- | -------------------------------: | --------------------: |
| Lote 2, primeiro contato                                        |                               12 |           4 (**33%**) |
| Lote 3, primeiro contato                                        |                               ~6 |          2 (**~33%**) |
| Após ampliar a regra (lotes 2 e 3, calibrados nos mesmos dados) |                          12 e ~6 |                10 e 6 |

Faltavam: chave em **constante** (`TOKEN_KEY`), **flag de login** no navegador
(`isAuthenticated = "true"`, `admin_authenticated`) e `session_id`. O "100%" que a regra tinha no
lote 1 era sobreajuste; o número após a ampliação, medido nos mesmos dados em que foi calibrada, é
otimista.

## Limites desta medição

Rotulador único (viés); amostra pequena e enviesada; "relevante" não significa "explorável"; o
`RLS_MISSING` considera relevante a ausência de RLS em **todo o SQL do repositório**, mas o RLS pode
ter sido ativado pelo painel do Supabase, fora do Git; recall só parcial. Use estes números como
**direção**, não como taxa de acerto do produto.
