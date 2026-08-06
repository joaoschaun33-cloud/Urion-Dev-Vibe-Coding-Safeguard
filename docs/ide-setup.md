# IDE Setup — Configurando sua IA para usar este repositorio

> Cada IDE/IA le regras de forma diferente. Configure corretamente para maximizar eficacia.

---

## 🖥️ Cursor (Recomendado)

### 1. Regras Globais (`.cursorrules`)

O Cursor le automaticamente o arquivo `.cursorrules` na raiz do projeto.
**Nao precisa configurar nada** — ja funciona.

### 2. Regras de Contexto (`.cursor/rules/*.mdc`)

O Cursor tambem le arquivos `.mdc` em `.cursor/rules/`.
Estes sao regras especificas por contexto (frontend, backend, etc.).

### 3. Como usar `@` para contexto

Na caixa de chat do Cursor, use `@` para mencionar arquivos:

```
@AGENTS.md
@.cursor/rules/honesty.mdc
@00-context/prd.md
```

**Dica**: Crie um snippet de contexto inicial:

```
@AGENTS.md
@.cursor/rules/honesty.mdc
@.cursor/rules/backend.mdc
@00-context/prd.md

Implemente a feature descrita no PRD.
```

### 4. Project Rules (Cursor Settings)

Va em `Cursor Settings > General > Project Rules` e adicione:

- `AGENTS.md`
- `.cursor/rules/honesty.mdc`

---

## 🌊 Windsurf (Codeium)

### 1. Cascade Memories

Windsurf usa "memories" em vez de `.cursorrules`.

Crie um arquivo `.windsurfrules` na raiz:

```
Leia AGENTS.md antes de qualquer codigo.
Leia .cursor/rules/honesty.mdc — honestidade e obrigatoria.
Siga Feature-Sliced Design (FSD) em src/features/.
Nunca misture logica de negocio na camada de interface.
```

### 2. Contexto

Use `@` na caixa de chat do Cascade para mencionar arquivos.

---

## 🤖 GitHub Copilot (VS Code)

### 1. Copilot Instructions

Crie `.github/copilot-instructions.md`:

```markdown
# Instrucoes para Copilot

Leia `AGENTS.md` para dogmas arquiteturais.
Leia `.cursor/rules/honesty.mdc` para regras de honestidade.
Siga Clean Architecture + FSD.
Toda feature em `src/features/<nome>/` com domain, application, infrastructure, presentation.
```

### 2. Contexto

Copilot nao tem `@` como Cursor. Use **Open Tabs** para manter arquivos de contexto abertos.

**Estrategia**:

1. Abra `AGENTS.md`, `honesty.mdc`, e `prd.md` em tabs
2. Trabalhe no arquivo que precisa de codigo
3. Copilot le o contexto das tabs abertas

---

## 🎯 Claude Code (Anthropic)

### 1. System Prompt

Claude Code aceita system prompts via `.claude-code/prompts.md`:

```markdown
# System Prompt

Voce e um desenvolvedor senior seguindo rigorosamente as regras deste projeto.

ANTES de qualquer codigo:

1. Leia `/AGENTS.md`
2. Leia `/.cursor/rules/honesty.mdc`
3. Leia `/sdlc.md`

REGRAS:

- Siga FSD (Feature-Sliced Design)
- Nunca misture logica de negocio na UI
- Nunca invente APIs, bibliotecas ou versoes
- Sempre declare nivel de certeza
- Documente suposicoes
```

### 2. Contexto

Use `/add` para adicionar arquivos ao contexto:

```
/add AGENTS.md
/add .cursor/rules/honesty.mdc
/add 00-context/prd.md
```

---

## 🔧 Cline (VS Code Extension)

### 1. Custom Instructions

Va em `Cline Settings > Custom Instructions` e cole:

```
Leia AGENTS.md e .cursor/rules/honesty.mdc antes de codar.
Siga FSD em src/features/.
Nunca invente APIs ou bibliotecas.
```

### 2. Contexto

Cline le arquivos automaticamente quando voce os menciona no chat.

---

## 📝 Checklist de Configuracao

- [ ] Arquivo `.cursorrules` esta na raiz (Cursor)
- [ ] Pasta `.cursor/rules/` existe com `.mdc` files
- [ ] Arquivo `.github/copilot-instructions.md` existe (Copilot)
- [ ] Arquivo `.windsurfrules` existe (Windsurf)
- [ ] Arquivo `.claude-code/prompts.md` existe (Claude Code)
- [ ] A IA foi instruida a ler `AGENTS.md` primeiro
- [ ] A IA foi instruida a ler `honesty.mdc` segundo
- [ ] O dev sabe usar `@` ou `/add` para contexto

---

## 🛡️ Urion VibeGuard MCP Server (< 5 min)

Coloca o Urion como **guarda em tempo real** dentro do seu editor de IA. As tools
são um parecer consultivo (advisory) que a IA pode chamar durante a geração — não um
bloqueio físico (bloqueio via hooks vem em fase futura).

### Tools expostas

- `urion_security_check({ code })` → `APPROVED` / `REJECTED` com as 5 vulnerabilidades
  críticas explicadas em português simples.
- `urion_explain_risk({ ruleId })` → explica o risco de uma regra
  (`SECRETS_HARDCODED`, `AUTH_CLIENT_SIDE`, `SQL_INJECTION`, `XSS_UNSANITIZED`,
  `RATE_LIMIT_MISSING`).

### Cursor

Adicione ao seu `~/.cursor/mcp.json` (ou ao `.cursor/mcp.json` do projeto):

```json
{
  "mcpServers": {
    "urion-vibeguard": {
      "command": "npx",
      "args": ["-y", "-p", "urion-safeguard", "urion-mcp-server"]
    }
  }
}
```

### Claude (Claude Code / Desktop)

```bash
claude mcp add urion-vibeguard -- npx -y -p urion-safeguard urion-mcp-server
```

### Rodar localmente a partir deste repositório (dev)

```bash
npm run build:mcp        # gera bin/urion-mcp-server.mjs (bundle esbuild)
node bin/urion-mcp-server.mjs   # sobe o servidor no stdio
```

Para apontar o editor ao build local, troque o `command`/`args` por
`"command": "node", "args": ["/caminho/para/bin/urion-mcp-server.mjs"]`.

> Nota de honestidade (Dogma Zero): o servidor foi validado com o cliente MCP oficial
> via stdio (lista as tools, retorna APPROVED/REJECTED reais). A confirmação dentro do
> Cursor/Claude específico é o passo final do usuário.
