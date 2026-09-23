# Changelog

Todas as alteracoes notaveis deste projeto serao documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
