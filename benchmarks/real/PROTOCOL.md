# Protocolo: medição em repositórios reais

O corpus sintético (`../RESULTS.md`) é otimista porque quem o escreveu conhece os detectores. Esta
medição roda os **mesmos dois motores** em projetos reais de terceiros.

## Regras éticas (não negociáveis)

1. **Só repositórios públicos, só leitura** (clone raso). Nada é executado, instalado ou modificado.
2. **Nomes de repositórios, caminhos de arquivos e valores de segredos nunca entram neste repositório**
   nem em relatórios. Publicamos apenas contagens agregadas. Os dados brutos ficam fora do Git
   (`benchmarks/real/data/` está no `.gitignore`).
3. **Credenciais encontradas não são usadas**, testadas nem copiadas. Se alguém quiser avisar os
   donos, isso é uma decisão humana e deve ser feito por canal privado.
4. Nenhum achado é apresentado como "vulnerabilidade confirmada": rotulamos como _relevante_ ou
   _falso alarme_ segundo o rubrico abaixo.

## Como reproduzir

```bash
# 1. Candidatos: projetos com o marcador do Lovable (exemplo; qualquer marcador serve)
gh search code "lovable-tagger" --filename package.json --limit 100 --json repository
# 2. Filtro: nao fork, nao arquivado, 50 KB < tamanho < 30 MB
# 3. git clone --depth 1 de cada um em benchmarks/real/data/repos/rNNN (indice anonimo)
# 4. Varredura dos dois motores:
npx tsx benchmarks/real/scan.ts benchmarks/real/data/repos benchmarks/real/data/findings.json
# 5. Rotulagem manual dos achados (rubrico abaixo)
```

## Rubrico de rotulagem

Um achado é **relevante** quando, olhando o código e o contexto, a falha descrita existe de fato:

| Regra                | Relevante quando                                                                 | Falso alarme quando                                                      |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `SECRETS_HARDCODED`  | credencial privada (token de API, chave de serviço) no código                    | chave pública por design (ex.: `apiKey` do Firebase Web)                 |
| `AUTH_CLIENT_SIDE`   | credencial de sessão/JWT em `localStorage`/`sessionStorage`                      | valor que não é credencial                                               |
| `XSS_UNSANITIZED`    | HTML de dados injetado sem sanitizar                                             | conteúdo estático (CSS, JSON-LD do próprio site) ou já escapado          |
| `RATE_LIMIT_MISSING` | login/registro sem nenhum limitador no app                                       | limitador montado em `app.use`/no router                                 |
| `RLS_MISSING`        | tabela sem RLS em **nenhum** SQL do repositório, em projeto Supabase             | RLS ativado em outra migração, ou projeto sem Supabase                   |
| `ERROR_SWALLOWED`    | catch vazio numa operação de dados/rede/servidor cuja falha muda o comportamento | limpeza (`unsubscribe`), mídia, `localStorage`, código gerado/minificado |
| `ENV_NOT_IGNORED`    | `.env` versionado com variável secreta preenchida                                | `.env` só com variáveis públicas (`VITE_*`, `NEXT_PUBLIC_*`)             |
| `ROUTE_NO_AUTH`      | rota sensível sem nenhuma autenticação em lugar algum do app                     | auth aplicada em outro ponto, ou rota de login                           |
| `N_PLUS_ONE`         | consulta por item dentro de laço sobre uma coleção                               | laço de tentativa/retry                                                  |
| `USERID_FROM_CLIENT` | `userId` do corpo usado para autorizar                                           | endpoint restrito a admin                                                |

## Limites

- **Um único rotulador** (viés). Idealmente um segundo revisor reclassifica uma amostra.
- **Amostra não aleatória**: os primeiros 99 resultados de uma busca de código, com viés para
  projetos front-end + Supabase.
- **Sem oráculo completo de recall.** Só é possível estimar recall onde há um verificador
  independente e amplo (ver `RESULTS.md`), e mesmo esse é um limite superior.
- O lote **não está congelado no Git**; repetir a medição exige um novo lote ou guardar o manifesto
  em local privado.
