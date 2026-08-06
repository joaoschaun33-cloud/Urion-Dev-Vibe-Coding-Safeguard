# Feature Spec — Fase 1: MCP Guard Real (núcleo do produto)

> Segue `docs/00-context/feature-spec.md`. SDLC (`docs/sdlc.md`).
> **STATUS: DECISÕES D1–D4 APROVADAS pelo PO (2026-08-05). ESPECIFICAR + PLANEJAR
> concluídos neste doc. Próximo: IMPLEMENTAR (aguarda "pode implementar").**
> Ref.: `docs/01-product/{posicionamento-estrategia,roadmap}.md` (Fase 1).
> Nível de certeza: ALTA no objetivo; MÉDIA nas decisões (aguardam sua call) e no
> detalhe exato da API do SDK (varia por versão — confirmar na instalação, Dogma Zero).

---

## 🎯 Feature: transformar o MCP guard de stub em servidor real conectável

### Contexto

Hoje `src/mcp/urion-mcp-server.ts` é uma **classe** (`UrionMcpGuardServer` com
`checkCodeSafety`/`explainRisk`) — a lógica existe, mas **não** é um servidor MCP:
não há transporte (stdio) nem registro de tools via SDK, então Cursor/Claude não
conseguem conectar. A Fase 1 entrega o coração do diferencial: um servidor MCP real
que o maker instala e que expõe a verificação como ferramenta que a IA pode chamar
durante a geração.

Restrição: a lógica de regras deve continuar vindo da **fonte única** (domínio TS,
Fase 0.4) — nada de nova cópia de regras.

---

## Requisitos (critérios de aceite)

- [ ] Existe um binário `urion-mcp-server` que sobe um servidor MCP real via **stdio**.
- [ ] O Cursor/Claude conecta ao servidor e **lista** as tools sem erro.
- [ ] Tool `urion_security_check` recebe um trecho de código e retorna
      APPROVED/REJECTED + violações (reusa `UrionMcpGuardServer`, regras da fonte única).
- [ ] Tool `urion_explain_risk` recebe um `ruleId` e retorna a explicação leiga.
- [ ] Guia de instalação em **< 5 min** (`docs/ide-setup.md` + `mcp-config.json` exemplo).
- [ ] Testes unitários das tools (entrada → saída), ≥80% na lógica nova.
- [ ] Zero overclaim: a doc deixa claro que a tool é **chamada pela IA** (advisory),
      não um bloqueio físico (bloqueio via hooks é Fase 2/3).

---

## ❓ DECISÕES que precisam da sua aprovação

**D1 — Adotar o SDK oficial `@modelcontextprotocol/sdk` (stdio).**
Nova dependência de produção. Alternativa (implementar JSON-RPC na mão) é reinventar
a roda e frágil. _Proposta (recomendada): usar o SDK oficial._ Versão/imports exatos
a confirmar na instalação (a API varia por versão — não vou inventar).

**D2 — Entrega do binário: compilar TS→`dist` e apontar um bin `urion-mcp-server`
para o compilado.** O servidor (TS em `src/mcp`) importa o domínio direto (fonte
única) e é compilado via `npm run build` (já existe `build: tsc`). O pacote já publica
tudo (sem campo `files`). _Proposta (recomendada): sim — bin compilado._
Trade-off: diferente do CLI atual (cjs sem build); mas o SDK e o domínio são TS.

**D3 — Escopo da Fase 1 = 2 tools sobre as 5 regras atuais.** Sem expandir regras,
sem gate de configuração (RLS/auth) — isso é Fase 2. _Proposta (recomendada): manter
escopo mínimo; entregar o veículo funcionando ponta a ponta primeiro._

**D4 — Enquadramento honesto (advisory, não bloqueio).** As tools MCP são invocadas
pela IA; não impedem fisicamente a escrita do arquivo. O bloqueio real (hooks
`PreToolUse`/pre-commit) entra na Fase 2/3. _Proposta (recomendada): documentar assim,
sem prometer "interceptação neural" que hoje não existe._

---

## Design Técnico (esboço; detalhado no PLANEJAR)

- **Camadas**: `src/mcp/` (servidor + registro de tools), `bin/` (entry do servidor),
  `docs/ide-setup.md` + `.mcp/mcp-config.json` (config exemplo).
- **Entidades novas**: nenhuma (reusa `UrionMcpGuardServer` e o domínio de regras).
- **Endpoints**: N/A (protocolo MCP via stdio, não HTTP).
- **Tools**: `urion_security_check(codeSnippet: string)`,
  `urion_explain_risk(ruleId: string)`.

---

## Dependências

- [ ] Aprovação do PO (D1–D4).
- [ ] `@modelcontextprotocol/sdk` (versão a confirmar na instalação).
- [ ] `zod` (já é dependência) para schema de input das tools.

---

## Critérios de Pronto (Definition of Done)

- [ ] Código seguindo AGENTS.md e `honesty.mdc`.
- [ ] Testes unitários (≥80%) da lógica nova; `tsc`/`eslint`/`smoke`/`cursor-doctor` ok.
- [ ] **Aceite manual**: conectar o servidor no Cursor/Claude, listar as 2 tools e
      obter um APPROVED e um REJECTED reais (registrar como evidência).
- [ ] `docs/ide-setup.md` com passo a passo < 5 min + `mcp-config.json` exemplo.
- [ ] Sem overclaim no README/docs; papel advisory documentado.
- [ ] Relatório de honestidade + nível de certeza.

---

## Riscos / trade-offs (Dogma Zero)

- **API do SDK varia por versão** — confirmar imports/assinaturas na instalação; não
  fixar versão/API por suposição.
- **Aceite depende de ambiente real** (Cursor/Claude) — parte do teste é manual; vou
  declarar o que foi testado em runtime e o que não.
- **Passo de build** para o bin do servidor (TS→dist) — diferente do CLI zero-install.
- **Advisory ≠ bloqueio** — não prometer enforcement físico nesta fase.

## Notas para a IA

- Reusar `UrionMcpGuardServer` e as regras da fonte única (Fase 0.4). NÃO duplicar regras.
- Só ir para PLANEJAR após D1–D4 aprovadas.

---

# PLANEJAR (Plan)

> D1–D4 aprovadas. SDK confirmado como existente (`@modelcontextprotocol/sdk`,
> `McpServer.registerTool`, `StdioServerTransport`) — imports variam por versão,
> confirmar na instalação. SDK ainda NÃO instalado no repo.

## Achados que guiam o plano

- `tsconfig`: `module: ESNext`, `moduleResolution: bundler`, `outDir: dist`,
  `rootDir: src`. **Risco real:** um bin ESM compilado por `tsc` mantém imports
  relativos SEM extensão `.js`, o que o Node ESM NÃO resolve em runtime. Ver
  "Decisão de empacotamento" abaixo.
- O teste `src/mcp/tests/unit/urion-mcp-server.test.ts` importa a classe
  `UrionMcpGuardServer` — ela DEVE continuar existindo e exportada (separar
  transporte de lógica).

## Decisão de empacotamento (refina D2)

Em vez de `tsc`→`dist` puro (que sofre o problema de extensão ESM no bin), **bundlar
o servidor com esbuild** num único arquivo self-contained:
`esbuild src/mcp/server.ts --bundle --platform=node --format=esm --outfile=bin/urion-mcp-server.mjs`.
Vantagens: SDK + domínio inlinados, sem problema de resolução, roda com `node`,
publica limpo, sem dep de runtime (esbuild é devDep). Bundle **gerado no
`prepublishOnly`** (e via `npm run build:mcp` no dev); o `.mjs` gerado vai no
`.gitignore`. Alternativa considerada e descartada: tsx como dep de produção (peso).

## Arquivos a criar / modificar

| Ação          | Arquivo                            | O quê                                                                                                                                                                         |
| ------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRIA          | `src/mcp/tools.ts`                 | Handlers PUROS: `runSecurityCheck(code)` e `runExplainRisk(ruleId)` retornando o resultado no formato de tool MCP. Delegam a `UrionMcpGuardServer`. Testáveis sem transporte. |
| CRIA          | `src/mcp/server.ts`                | Entry do servidor: cria `McpServer`, `registerTool` das 2 tools (schema Zod), conecta `StdioServerTransport` num `main()` quando executado.                                   |
| MANTÉM        | `src/mcp/urion-mcp-server.ts`      | Continua exportando `UrionMcpGuardServer` (lógica) — sem quebrar o teste existente.                                                                                           |
| MODIFICA      | `package.json`                     | bin `urion-mcp-server` → `bin/urion-mcp-server.mjs`; dep `@modelcontextprotocol/sdk`; devDep `esbuild`; scripts `build:mcp` + `prepublishOnly`; incluir no `build`.           |
| CRIA (gerado) | `bin/urion-mcp-server.mjs`         | Bundle esbuild (gitignored; produzido no build/publish).                                                                                                                      |
| MODIFICA      | `.gitignore`                       | Ignorar `bin/urion-mcp-server.mjs`.                                                                                                                                           |
| MODIFICA      | `.mcp/mcp-config.json`             | Entrada exemplo `urion` (`command: npx`, `args: ["-p","urion-safeguard","urion-mcp-server"]`).                                                                                |
| MODIFICA      | `docs/ide-setup.md`                | Guia < 5 min: instalar/configurar no Cursor e Claude.                                                                                                                         |
| CRIA          | `src/mcp/tests/unit/tools.test.ts` | Testa `runSecurityCheck` (APPROVED/REJECTED) e `runExplainRisk`.                                                                                                              |

## Contratos das tools

```
// src/mcp/tools.ts
runSecurityCheck(input: { code: string }): {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent: {
    allowed: boolean;
    status: 'APPROVED' | 'REJECTED';
    violations: Array<{ ruleId: string; title: string; descriptionLeiga: string; riscoReal: string; recomendacao: string }>;
  };
  isError: false;
}

runExplainRisk(input: { ruleId: string }): {
  content: Array<{ type: 'text'; text: string }>;
  isError: boolean; // true se ruleId desconhecido
}
```

Registro (server.ts): `server.registerTool('urion_security_check', { description, inputSchema: { code: z.string() } }, handler)` e idem para `urion_explain_risk` com `{ ruleId: z.string() }`. (Assinatura exata conforme versão do SDK — confirmar.)

## Plano de testes (casos de borda)

- `runSecurityCheck`: código seguro → APPROVED, 0 violações; secret hardcoded →
  REJECTED, violação `SECRETS_HARDCODED`; múltiplas violações; string vazia → APPROVED.
- `runExplainRisk`: ruleId válido → texto com título/risco; ruleId inválido →
  `isError: true` + mensagem clara (sem inventar).
- Mantém verdes os testes existentes de `UrionMcpGuardServer`.
- **Aceite manual (runtime real):** conectar no Cursor/Claude, listar as 2 tools,
  obter 1 APPROVED e 1 REJECTED. Declarar como testado-em-runtime no relatório.

## Dependências e substituições (Dogma Zero)

- `@modelcontextprotocol/sdk` (prod) — versão a confirmar na instalação.
- `esbuild` (dev) para o bundle do bin.
- Substituição declarada: aceite parcialmente manual (depende de cliente MCP real);
  o que não for testável em CI será explicitamente marcado como não-testado-em-runtime.

## Certeza

ALTA no desenho (separação lógica/transporte, contratos, testes). MÉDIA no
empacotamento/execução do bin (o bundle esbuild resolve o risco ESM, mas confirmo
rodando de fato na IMPLEMENTAÇÃO) e na assinatura exata do SDK (varia por versão).
