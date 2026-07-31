# 🧠 Urion Dev Vibe Coding Safeguard & Product Owner Open Source Template

> **Clone, configure, proteja seu projeto. Uma plataforma Open Source completa para desenvolvimento com IA (vibe coding) sem alucinações, débitos técnicos ou colapso arquitetural.**

[![CI](https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard/actions/workflows/ci.yml/badge.svg)](https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard/actions/workflows/ci.yml)
[![Security](https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard/actions/workflows/security.yml/badge.svg)](https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Como Criar um Projeto Novo em 1 Segundo

Você pode inicializar um novo projeto blindado rodando apenas um comando via **NPX**:

```bash
npx create-vibe-safeguard meu-novo-app
```

---

## 🛡️ O que é o Urion Safeguard?

Uma solução arquitetural e operacional desenhada especialmente para **solopreneurs, criadores não-técnicos e desenvolvedores** que usam assistentes de IA (Cursor, Antigravity/Gemini, Claude Code, Windsurf, Copilot) para construir software.

Ele impõe o **Dogma Zero (Honestidade Absoluta da IA)**, **Feature-Sliced Design (FSD)**, **Spec-Driven Development (SDD)** e **Proteção contra Prompt Injection**, garantindo que o seu sonho digital não vire frustração nem colapse por falta de arquitetura.

---

## 💻 Como Rodar este Repositório Localmente

### 1. Iniciar o Backend & Banco de Dados

```bash
git clone https://github.com/joaoschaun33-cloud/Urion-Dev-Vibe-Coding-Safeguard.git meu-app && cd meu-app
docker-compose up -d
npm install
npm run dev
```

- **API REST**: http://localhost:3000/api/v1/health

### 2. Iniciar o Dashboard Web (React + Vite)

```bash
npm run dev:web
```

- **Interface Web**: http://localhost:5173

### 3. Diagnóstico Instantâneo via CLI

```bash
npm run doctor:cli
```

---

## 🎯 Principais Recursos do Repositório

| Recursos                                  | Como ajuda o Vibe Coder                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 🎨 **Dashboard Web React (v1.0)**         | Painel Dark Mode para acompanhar o score de saúde do projeto e especificações SDD em tempo real.           |
| 🖥️ **CLI Doctor Interativo**              | Comando `npm run doctor:cli` que calcula o score do projeto (0-100) direto no terminal em 1 segundo.       |
| 🛡️ **Dogma Zero: Honestidade**            | Regra estrita que impede a IA de inventar APIs, omitir erros ou mentir sobre testes.                       |
| 🏗️ **Arquitetura FSD & Clean Arch**       | Módulos isolados (`domain`, `application`, `infrastructure`, `presentation`) para evitar código espaguete. |
| ⚡ **Gerador CLI de Features**            | Crie novas funcionalidades isoladas em 1 segundo: `npm run generate:feature <nome>`.                       |
| 📝 **Especificações SDD (`00-context/`)** | Documentos Markdown vivos (`vision.md`, `prd.md`, `user-stories.md`) como a fonte única de verdade.        |

---

## 📁 Estrutura de Pastas

```
vibe-coding-template-repo/
│
├── 🎨 web/                      ← Dashboard Web (React + Vite + TailwindCSS)
│
├── 🧠 .cursor/rules/            ← BIBLIA da IA (Regras Heurísticas MDC)
│   ├── honesty.mdc              ← ⭐ Dogma Zero: A IA nunca mente
│   └── architecture.mdc, testing.mdc, security.mdc...
│
├── 🏗️ src/                      ← Backend API (TypeScript / Express)
│   ├── app/                     ← Routing & Middlewares
│   ├── features/
│   │   ├── project-health/      ← 📊 Feature de Auditoria de Saúde
│   │   ├── spec-manager/        ← 📝 Feature de Gestão de Especificações SDD
│   │   └── todo/                ← ⭐ Exemplo de Referência (FSD)
│   └── shared/                  ← Respostas RFC 7807, Logger (Pino), Prisma
│
├── 🔧 tools/
│   ├── dashboard-cli.js         ← 🖥️ Dashboard Interativo CLI
│   └── cursor-doctor.js         ← 🩺 Diagnóstico Estático do Repositório
│
├── 📚 00-context/               ← Visão e PRD do Produto
├── 👥 01-product/               ← Personas e User Stories
├── ⚙️ Makefile                  ← Comandos unificados (`make check`, `make doctor`)
└── 📄 AGENTS.md                 ← Manifesto Universal de IA
```

---

## 📦 Comandos Principais

| Comando                    | Descrição                                      |
| -------------------------- | ---------------------------------------------- |
| `npm run dev`              | Inicia o servidor backend na porta 3000        |
| `npm run dev:web`          | Inicia o Dashboard Web React na porta 5173     |
| `npm run doctor:cli`       | Exibe o gráfico de saúde no terminal           |
| `npm run cursor-doctor`    | Valida 100% da integridade de arquivos do repo |
| `npm run generate:feature` | Gera o esqueleto de uma nova feature isolada   |
| `npm test`                 | Executa todos os testes unitários via Vitest   |

---

## 📜 Licença

[MIT](LICENSE) © 2026 Vibe Coding Safeguard Contributors

<p align="center">
  <b>Feito com 💜 pela comunidade de vibe coding</b><br>
  <i>"Clone, crie com IA, proteja seu projeto."</i>
</p>
