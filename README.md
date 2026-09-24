# 🛡️ Urion VibeGuard

> **O Guarda-Costas Digital para Vibe Coders e Criadores No-Code / Low-Code.**

[![npm version](https://img.shields.io/npm/v/urion-safeguard.svg?style=flat-square&color=cyan)](https://www.npmjs.com/package/urion-safeguard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Estado (honesto):** projeto jovem, **ainda não validado com usuários reais nem medido contra apps vulneráveis de verdade**. A detecção é por regras/heurísticas (regex) e tem falsos negativos: num corpus interno de 195 casos (feito por nós, portanto otimista), o `vibeguard` encontrou **43%** dos casos vulneráveis e o `urion-checks` **60%** — [números e erros por regra](benchmarks/RESULTS.md). Em 81 repositórios reais, cerca de **2 em cada 3 alertas do `urion-checks` eram falso alarme** (precisão 33–40%) e o `vibeguard` **não lê arquivos `.env`** — [medição em repositórios reais](benchmarks/real/RESULTS.md). Este repositório **não** exibe o selo "Grade A" porque o próprio `npm run launch:gate` ainda o reprova.

Ferramentas como **Cursor, Lovable, Bolt e v0** permitem criar aplicativos completos em minutos apenas com prompts. No entanto, pesquisas recentes mostram que **cerca de 45% do código gerado por IA introduz falhas de segurança conhecidas** ([Veracode, 2025](https://www.veracode.com/blog/ai-generated-code-security-risks/)) — como chaves de API expostas, logins desprotegidos e riscos de invasão de banco de dados.

O **Urion VibeGuard** é uma ferramenta ultraleve e sem fricção que analisa seu código instantaneamente, explica os riscos em **português simples** e ajuda a reduzir o risco de o seu aplicativo ser invadido (não o elimina — veja [quando usar e quando evitar](docs/quando-usar-e-evitar.md)).

---

## 🚀 Uso Rápido em 3 Segundos (Zero Setup)

Você **não** precisa de banco de dados nem de configurar servidores. Precisa apenas do **Node.js 20 ou superior**. Rode o comando abaixo na pasta do seu projeto:

```bash
npx urion-safeguard vibeguard
```

**Privacidade:** nada sai da sua máquina. Nenhum comando do CLI faz requisição de rede (o `npm run pack:tool` reprova o pacote se algum arquivo do CLI passar a usar rede, e há teste automatizado para o comando `blueprint`); o servidor MCP fala apenas por stdio. O pacote publicado no npm tem **zero dependências**.

### ⚡ O que acontece quando você roda?

1. **Varredura Instantânea**: Analisa seu código procurando as 5 falhas mais letais de apps gerados por IA.
2. **Diagnóstico Amigável**: Mostra seu **Score de Segurança (0 a 100)** e explica em português simples o risco real de cada problema.
3. **Como Corrigir**: Explica, em português simples, o passo a passo para corrigir manualmente cada risco encontrado.

---

## 🎯 As 5 Vulnerabilidades Que o Urion Detecta

| Vulnerabilidade              | O Risco Real para Seu App                                                                                         | Como o Urion Resolve                                                               |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| 🔑 **Secrets Hardcoded**     | Chaves Stripe, OpenAI ou AWS expostas no código público podem gerar cobranças de milhares de reais no seu cartão. | Identifica chaves expostas e orienta a migração para variáveis de ambiente `.env`. |
| 🔓 **Auth Client-Side**      | Login do usuário salvo no `localStorage` do navegador pode ser roubado por scripts maliciosos.                    | Recomenda o uso de Cookies seguros `HttpOnly`.                                     |
| 🛡️ **SQL Injection**         | Entradas de texto desprotegidas permitem que hackers apaguem ou baixem todo o seu banco de dados.                 | Detecta interpolação de texto e exige Prepared Statements / ORM.                   |
| ⚠️ **Exibição XSS**          | Exibir textos externos sem filtragem permite a invasores controlar a tela dos seus usuários.                      | Alerta a necessidade da biblioteca de sanitização `DOMPurify`.                     |
| 🚦 **Rate Limiting Ausente** | Páginas de login sem limite de tentativas facilitam ataques de robôs adivinhando senhas.                          | Alerta a ausência de bloqueio contra força bruta em rotas sensíveis.               |

---

## 🤖 Prevenção em Tempo Real com IA (Cursor / Claude / Antigravity)

Além do scanner de terminal, o Urion traz regras e ferramentas que **reduzem a chance** de a IA gerar código inseguro (são orientações e pareceres consultivos — não uma garantia nem um bloqueio físico):

### 1. Regras Automáticas `.cursor/rules/security.mdc`

Copie o arquivo `.cursor/rules/security.mdc` para o seu projeto. O Cursor passa a ser instruído a evitar chaves expostas e rotas inseguras (é uma instrução à IA; ela pode falhar em segui-la).

### 2. Servidor MCP (`urion-mcp-server`)

Servidor MCP real (transporte stdio) que a IA consulta durante o trabalho. Ferramentas:

| Tool                   | Para quê                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `urion_security_check` | Parecer `APPROVED`/`REJECTED` de um trecho de código (5 vulnerabilidades críticas)                                |
| `urion_explain_risk`   | Explica o risco de uma regra em português simples                                                                 |
| `urion_spec_gate`      | Antes de implementar: existe spec com critérios de aceite? Se não, a IA deve pedir a spec                         |
| `urion_launch_gate`    | "Pronto para o ar?" — Grade A só com spec concluída, cobertura real ≥ 80%, zero críticos e auditoria independente |

Para registrar no editor (exemplo de configuração MCP):

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

> **O que foi e o que não foi testado (honestidade):** o servidor foi testado por instalação isolada do pacote e chamadas reais às 4 ferramentas via protocolo MCP. **Não** foi testado ainda dentro do Cursor ou do Claude Desktop. O MCP é **consultivo**: o bloqueio de verdade vem do pre-commit/CI. Detalhes em [`docs/ide-setup.md`](docs/ide-setup.md).

### 3. Gates de processo (no repositório)

```bash
npm run checks -- --strict   # R1–R9 + N+1 (bloqueia commit com CRITICAL)
npm run launch:gate          # Grade A só com spec + testes reais + segurança + auditoria
npm run audit:validate -- .urion/audit/<relatorio>.json
```

A auditoria segue [`prompts/auditor.md`](prompts/auditor.md) (revisor em contexto novo, com evidência por achado). O validador confere consistência e evidência; **não consegue provar** que o contexto foi realmente limpo.

---

## 🏆 Selo Urion Verified (autodeclarado)

O selo é **autodeclarado e sem verificação externa** — qualquer um pode colá-lo. Use somente se o seu projeto realmente passou nos gates (`npm run launch:gate` → Grade A), e nunca como substituto de uma revisão profissional: ele existe para **forçar** a revisão, não para dispensá-la. Onde há dinheiro, dados pessoais ou compliance, leia antes [quando usar e quando evitar](docs/quando-usar-e-evitar.md).

```markdown
[![Urion Verified Grade A](https://img.shields.io/badge/Urion_Verified-Grade_A-brightgreen.svg?style=flat-square)](https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard)
```

---

## 🗂️ O que há neste repositório (duas coisas distintas)

|                 | **A ferramenta** (o produto)                                                     | **O template de referência**                                                                                    |
| --------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| O que é         | CLI `urion-safeguard`, servidor MCP e gates (`urion-checks`, `launch:gate`)      | App de exemplo (Express + Prisma + Todo) que aplica a metodologia: Feature-Sliced Design, SDD, ADRs, Dogma Zero |
| Onde            | `bin/`, `src/mcp/`, `src/features/security-audit/`, `src/features/spec-manager/` | `src/app/`, demais `src/features/`, `prisma/`, `Dockerfile`, `web/`                                             |
| Vai para o npm? | **Sim** (zero dependências, gerado por `npm run pack:tool`)                      | **Não** — use clonando o repositório                                                                            |
| Para quem       | Quem quer proteger e governar um projeto vibe-coded que já existe                | Quem quer começar um app do zero com essa disciplina ([QUICKSTART.md](QUICKSTART.md))                           |

A raiz do repositório é `private` de propósito: só o pacote gerado em `.npm-package/` é publicável (`npm run publish:tool`).

---

## 📄 Licença

Distribuído sob a licença MIT. Criado para proteger a comunidade de Vibe Coders e Makers.
