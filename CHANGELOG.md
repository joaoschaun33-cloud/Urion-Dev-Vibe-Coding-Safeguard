# Changelog

Todas as alteracoes notaveis deste projeto serao documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Benchmark dos detectores** (`npm run benchmark`, pasta `benchmarks/`): corpus
  sintético de 195 mini-projetos (vulneráveis e seguros) rodado contra os dois
  motores reais (`vibeguard` e `urion-checks`), com recall, precisão e intervalo
  de confiança de Wilson por regra em `benchmarks/RESULTS.md`. Linha de base
  (corpus sintético, portanto otimista): `vibeguard` acha 43% dos casos
  vulneráveis (IC 31–57%), precisão 71%; `urion-checks` acha 60% (IC 48–71%),
  precisão 85%.
- **Medição em 81 repositórios públicos reais** (`benchmarks/real/`, protocolo e
  resultados agregados; nenhum nome/caminho/segredo de terceiros é publicado).
  Precisão medida: `urion-checks` 33% dos achados (40% por repositório),
  `vibeguard` 64% (63%); `XSS_UNSANITIZED` só 10%. Recall parcial: `vibeguard`
  acusou 6 de 11 repositórios com token em web storage e 0 de 6 arquivos `.env`
  com segredo. Fez 26% dos repositórios terem ao menos um achado relevante.
- `scanProject()` exportada de `bin/lib/mode-maker.cjs` (a varredura pura que o
  comando `vibeguard` executa), para o benchmark medir o mesmo código do usuário.

### Changed

- `vibeguard`: quando o scan não encontra nada, deixa de dizer "SEU APLICATIVO
  ESTÁ SEGURO E PRONTO PARA O AR" e de sugerir o selo Grade A. Agora diz que nenhum
  dos 5 padrões foi encontrado e que isso **não** prova segurança.

### Fixed

- `vibeguard` passa a **ler arquivos `.env`** (`.env`, `.env.local`, `.env.production`,
  `nome.env`; ignora `.env.example`). Antes o filtro de extensão nunca casava com `.env`
  e 0 de 6 arquivos com segredo real eram vistos. Lógica própria (`NOME=valor` sem
  aspas; respeita `VITE_*`/`NEXT_PUBLIC_*`; ignora placeholders; URL de banco só com
  credenciais) e o snippet do achado nunca carrega o valor. Também passa a varrer
  `.mjs`/`.cjs` e a reconhecer tokens `sbp_` (Supabase).
- `XSS_UNSANITIZED`: fim do falso alarme em código **sanitizado**
  (`__html: DOMPurify.sanitize(x)` com o espaço que o Prettier gera; o `\s*` desfazia a
  exceção por backtracking), em JSON-LD (`JSON.stringify`), CSS (`<style>`) e literais
  estáticos; passa a cobrir `innerHTML`, `outerHTML`, `document.write` e
  `insertAdjacentHTML` dinâmicos. Em 81 repositórios reais a precisão foi de 10% para
  71%; o `vibeguard` inteiro, de 64% para 90% (por repositório, 63% → 81%).

### Known issues (medidos, ainda NÃO corrigidos)

- XSS multilinha (`dangerouslySetInnerHTML={{` + quebra + `__html: x`) não é detectado
  pelo CLI (modo linha); o servidor MCP (trecho inteiro) detecta. Uma alternativa que
  tentava cobrir isso gerou 70 falsos alarmes no `chart.tsx` do shadcn/ui e foi removida.
- Falsos alarmes medidos em código real: `RLS_MISSING` analisa um arquivo SQL por
  vez (44% dos alertas tinham o RLS ativado em outra migração do mesmo repositório);
  `ENV_NOT_IGNORED` não olha o conteúdo do `.env` (17 de 23 só tinham variáveis
  públicas) e considera `.env` no `.gitignore` como cobrindo `.env.production`;
  `ROUTE_NO_AUTH` não reconhece middlewares como `protect` nem auth montada em
  `app.use(path, auth, router)`; `ERROR_SWALLOWED` acusa limpeza inofensiva e código
  gerado/minificado.
- Detecção perdida em padrões comuns de apps gerados por IA (Next.js App Router,
  Fastify, Supabase, Drizzle/Mongoose, `.env.local` coberto só por `.env`, entre
  outros). Lista completa por caso em `benchmarks/RESULTS.md`.

## [3.0.0] — 2026-09-23

> Separação entre a **ferramenta** (CLI + MCP + gates) e o **template de referência**,
> mais uma correção de privacidade no comando `blueprint`. Justificativa em
> `docs/decisions-log.md`.

### Security

- **`blueprint` não envia mais nada pela rede.** Até a 2.1.0 o comando enviava
  metadados do projeto (stack, contagens de arquivos/testes/commits e nomes de
  projeto/features reduzidos a hash SHA-256 truncado) para `api.urion.dev`, **sem
  pedir consentimento**. Esse domínio não resolve (`ENOTFOUND` em 2026-09-23), então
  o envio nunca funcionou e sempre caía no salvamento local; mas, se alguém
  registrasse o domínio, passaria a receber esses dados de todo CLI instalado. O
  comando agora só grava `.urion/blueprints/*.json` localmente. Teste de regressão
  em `src/shared/infrastructure/tests/blueprint-local-only.test.ts`.
- O `blueprint` também imprimia como fatos coisas que o código nunca verificava
  ("Credenciais: zero detectadas", "Dados de negócio: removidos"). Removido. O hash
  de nomes **não** é anonimização forte (nomes comuns são recuperáveis por
  dicionário) e a saída agora diz isso.

### Changed

- **BREAKING — o pacote npm passa a conter só a ferramenta:** `bin/` (CLI, MCP,
  `urion-checks`) + docs. Zero dependências (antes: 17, incluindo Express, Prisma,
  BullMQ e ioredis; instalar levava ~25 s e 230 pacotes, agora 1 s e 1 pacote).
  Saem do pacote: `main`/`dist` (era o servidor Express de demonstração),
  `prisma/`, `bin/create-vibe-safeguard.js` e `bin/cli.js` (scaffolder do
  template), `postinstall: prisma generate`.
- O pacote é gerado por `npm run pack:tool` (manifesto próprio em
  `.npm-package/`); o `package.json` da raiz é `private`. `npm run pack:tool` reprova
  o pacote se algum arquivo importar dependência que não viaja com ele ou (fora do
  bundle do MCP) usar API de rede.
- README: removido o badge "Urion Verified: Grade A" do topo (este repositório
  ainda é reprovado pelo próprio `launch:gate`); explicitado que o projeto não foi
  validado com usuários reais nem medido contra apps vulneráveis; nota de
  disponibilidade no npm corrigida.

### Fixed

- Projeto sem git: o `fatal: not a git repository` do próprio git vazava para a
  tela do CLI.

## [2.1.0] — 2026-09-23

> Roadmap Fase 3 (gates de processo) + limpeza de dívida de honestidade encontrada
> por dogfooding. Detalhe e justificativa de cada item em `docs/decisions-log.md`.

### Added

- Tools MCP `urion_spec_gate` (gate de spec: recusa consultivamente implementar
  sem spec com critérios de aceite) e `urion_launch_gate` (Grade A só com spec
  concluída + cobertura real ≥ 80% + zero críticos + auditoria independente).
- Scripts `npm run launch:gate` e `npm run audit:validate`.
- Detector `N_PLUS_ONE` (consulta de leitura dentro de loop) no `urion-checks`.
- Detectores de config gate para R2 (`userId` vindo de `req.body`), R6 (catch
  vazio), R7 (`data: req.body` sem validação) e R9 (webhook de pagamento sem
  verificação de assinatura).
- Validação por código do relatório do Auditor em contexto fresco (evidência
  obrigatória por achado; `APPROVED` que contradiz achado CRITICAL/HIGH aberto
  é bloqueado): `prompts/auditor.md`, subagente `.claude/agents/urion-auditor.md`,
  exemplo em `templates/audit-report.example.json`.
- `docs/quando-usar-e-evitar.md`: tabela de viabilidade (pagamentos,
  multi-tenancy, tempo real, compliance, sistemas críticos) e o que cada gate
  garante/não garante.
- Leitura de cobertura real (`coverage/coverage-summary.json`) pelo scanner do
  produto (`bin/lib/coverage-reader.cjs`), em vez de estimativa por proxy.

### Changed

- `urion-checks --strict` agora roda no `.husky/pre-commit` e no CI, bloqueando
  commit com achado CRITICAL (antes só gerava relatório sob demanda).
- CI (`ci.yml`): o step "Coverage Gate" agora roda `npm run test:coverage` de
  fato (antes rodava `npm run test`, sem medir cobertura nenhuma).
- Cobertura unitária de 68% para 90,8% linhas / 89,9% branches / 92,8% funções
  (146 → 213 testes); limiar do `vitest.config.ts` (ratchet honesto) sobe de
  67/75/75 para 90/92/89.
- README sem overclaim: remove "nunca gere código inseguro", "impede que seja
  hackeado", "bloqueia" e o pacote inexistente `@urion/mcp-server`; documenta
  as 4 tools MCP reais e os gates; selo marcado como autodeclarado.
- `docs/01-product/roadmap.md` e `docs/01-product/posicionamento-estrategia.md`
  sincronizados com o código real (estavam descrevendo o servidor MCP como
  "stub" muito depois de ele existir).
- `docs/decisions-log.md` virou índice cronológico apontando para `docs/adrs/`
  em vez de duplicar o conteúdo de ADRs existentes.
- `.gitignore`: `.urion/audit/` passou a ser versionável (evidência de
  auditoria precisa entrar no repositório/CI).

### Fixed

- Vazamento de processo no `CodeSandboxRunner` no Windows: o timeout nativo do
  `child_process.exec` matava só o `cmd.exe`, deixando o processo real (ex.:
  `node -e "while(true){}"`) órfão e rodando indefinidamente — o teste
  reportava sucesso enquanto o recurso nunca era liberado.
- `bin/create-vibe-safeguard.js`: `const tokenConfigPath` declarado duas vezes
  e anotação de tipo TypeScript num arquivo `.js` — dois `SyntaxError` reais
  que faziam `npm run create:app` quebrar antes de qualquer lógica rodar.
- 3 blocos `catch` vazios (`bin/create-vibe-safeguard.js`,
  `bin/lib/mode-maker.cjs`) agora logam o erro em vez de descartá-lo em
  silêncio.
- `urion-checks` escaneava `bin/urion-mcp-server.mjs` (bundle esbuild de
  962KB) linha a linha, gerando achados que apontavam para dependência de
  terceiro empacotada; agora ignora arquivos de código acima de 200KB.
- Scanner do produto (`npx urion-safeguard scanner`) estimava cobertura por
  `testFiles / codeFiles` (proxy sem relação com execução real de teste); lê
  `coverage-summary.json` real quando existe, ou diz "não medida".

## [2.0.3] — 2026-08-08

Republicação sem mudança de conteúdo além do número de versão
(`package.json`/`package-lock.json`).

## [2.0.2] — 2026-08-08

### Fixed

- `bin` do `package.json` sem prefixo `./` (compatibilidade com npm 12).

## [2.0.1] — 2026-08-08

Fases 0–2A do roadmap: credibilidade, servidor MCP real e config gate.

### Added

- Servidor MCP real (transporte stdio, SDK `@modelcontextprotocol/sdk`) com as
  tools `urion_security_check` e `urion_explain_risk`, com retorno estruturado
  (status/score/findings).
- Config gate Bloco A: `urion-checks` detectando RLS ausente, rotas sem auth e
  `.env`/segredos versionados.
- Fonte única das regras (`VIBE_GUARD_RULES`), sincronizada para
  `.cursor/rules` via script gerador.
- Veredito "anti-falso-verde" do scanner: status não passa de `ATENCAO` quando
  a cobertura está abaixo do limite ou há achado crítico, mesmo com governança
  100%.

### Fixed

- Overclaims removidos do README/CLI: comando `fix` que não existia e
  estatística "92%" sem fonte.

### Security

- Ampliada a detecção de segredos hardcoded (tokens de provedores conhecidos)
  e filtros para não sinalizar arquivos de teste/fixture.

## [1.0.0] — 2026-07-29

### Added

- Lançamento inicial do Vibe Coding Template Repo
- BIBLIA do vibe coding: honestidade, arquitetura, governanca
