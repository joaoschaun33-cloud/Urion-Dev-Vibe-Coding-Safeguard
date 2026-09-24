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

## Limites desta medição

Rotulador único (viés); amostra pequena e enviesada; "relevante" não significa "explorável"; o
`RLS_MISSING` considera relevante a ausência de RLS em **todo o SQL do repositório**, mas o RLS pode
ter sido ativado pelo painel do Supabase, fora do Git; recall só parcial. Use estes números como
**direção**, não como taxa de acerto do produto.
