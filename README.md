# 🧠 Vibe Coding Template Repo

> **Clone, configure, rode. Em 5 minutos voce tem uma API REST completa com arquitetura FSD, testes, e uma IA que nunca mente.**

[![CI](https://github.com/seu-usuario/vibe-coding-template-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/vibe-coding-template-repo/actions/workflows/ci.yml)
[![Security](https://github.com/seu-usuario/vibe-coding-template-repo/actions/workflows/security.yml/badge.svg)](https://github.com/seu-usuario/vibe-coding-template-repo/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 O que voce ganha em 5 minutos

```bash
git clone <repo> meu-app && cd meu-app
docker-compose up -d
npm install
npm run db:migrate
npm run dev
```

Acesse http://localhost:3000/api/v1/health — **funciona**.

Crie um Todo:
```bash
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello Vibe Coding", "priority": "HIGH"}'
```

---

## 🎯 Por que este template e diferente

| Outros templates | Este template |
|-----------------|---------------|
| So regras, nenhum codigo | **Todo App completo** funcionando com FSD |
| IA que inventa APIs | **Dogma Zero: Honestidade** — a IA admite quando nao sabe |
| Sem testes | **Testes unitarios + integracao** com 80% cobertura |
| Sem banco | **PostgreSQL + Redis** via Docker Compose |
| Sem CI/CD | **GitHub Actions** com SAST, secret scan, lint |
| Sem TypeScript | **TSConfig, ESLint, Prettier** configurados |
| Sem exemplos | **Templates de feature, componente, endpoint** prontos |

---

## 📁 Estrutura

```
vibe-coding-template-repo/
│
├── 📄 .cursorrules              ← Cursor le automaticamente
├── 📄 AGENTS.md                 ← Dogmas (Honestidade = #0)
│
├── 🧠 .cursor/rules/            ← BIBLIA da IA
│   ├── honesty.mdc              ← ⭐ A IA nunca mente
│   ├── frontend.mdc, backend.mdc, testing.mdc
│   ├── security.mdc, performance.mdc, accessibility.mdc
│   └── documentation.mdc, database-skill.mdc
│
├── 🏗️ src/                      ← Codigo que RODA
│   ├── app/                     ← Servidor Express + rotas + middleware
│   │   ├── server.ts            ← 🚀 API REST na porta 3000
│   │   ├── routes.ts            ← Wiring de features
│   │   └── middleware/
│   ├── features/
│   │   └── todo/                ← ⭐ EXEMPLO COMPLETO (FSD)
│   │       ├── domain/          ← Entidade, repositorio, erros
│   │       ├── application/     ← Use cases, DTOs
│   │       ├── infrastructure/  ← Prisma repository
│   │       ├── presentation/    ← Controller
│   │       └── tests/unit/      ← Testes com Vitest
│   └── shared/                  ← Utilitarios reais
│       ├── errors/              ← DomainError base
│       ├── http/                ← RFC 7807 ProblemDetails
│       ├── infrastructure/      ← Logger (Pino), Database (Prisma)
│       └── utils/               ← cn() para Tailwind
│
├── 🐳 docker-compose.yml        ← PostgreSQL 16 + Redis 7
├── 📦 prisma/schema.prisma      ← Schema do Todo App
│
├── ⚙️ tsconfig.json             ← Paths @/* configurados
├── 🔍 eslint.config.js          ← Regras rigorosas
├── ✨ prettier.config.js        ← Formatacao padronizada
├── 🧪 vitest.config.ts          ← Cobertura >= 80%
│
├── 📚 00-context/               ← Contexto de produto
├── 👥 01-product/               ← Personas e user stories
├── 📝 docs/                     ← Onboarding, arquitetura, anti-patterns
├── 💬 prompts/                  ← 8 templates para a IA
├── 📐 templates/                ← Blueprints de feature, componente, endpoint
│
├── 🧪 checks/smoke.test.js      ← Valida em ~1s
├── 🔧 tools/cursor-doctor.js    ← Diagnostico de saude
├── 🚀 first-time.sh             ← Setup automatico
├── ⚙️ Makefile                  ← Comandos padronizados
│
├── 🔒 .github/workflows/        ← CI + SAST + Security
├── 🐛 .github/ISSUE_TEMPLATE/   ← Bug, AI Hallucination, Feature
├── 📋 PULL_REQUEST_TEMPLATE.md  ← Checklist completo
│
└── 📄 QUICKSTART.md             ← Seus primeiros 5 minutos
```

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20+ + TypeScript 5.5 |
| Framework | Express 4 |
| ORM | Prisma 5 + PostgreSQL 16 |
| Cache | Redis 7 |
| Validacao | Zod |
| Logs | Pino (JSON estruturado) |
| Testes | Vitest + Playwright |
| Lint | ESLint + Prettier |
| CI/CD | GitHub Actions |

---

## 🧠 Como usar com IA

### 1. Mencione o contexto obrigatorio
```
@AGENTS.md
@.cursor/rules/honesty.mdc
@00-context/prd.md
```

### 2. A IA segue o SDLC
```
Especificar → Planejar → Implementar → Auto-Revisar → PR
```

### 3. Valide continuamente
```bash
make check        # lint + smoke + doctor
make test-smoke   # ~1 segundo
make doctor       # diagnostico completo
```

### 4. Adicione features rapidamente
```bash
bash scripts/generate-feature.sh payments
# Gera toda a estrutura FSD pronta para preencher
```

---

## 📦 Comandos (Makefile)

| Comando | Descricao |
|---------|-----------|
| `make dev` | API na porta 3000 com hot reload |
| `make test` | Testes unitarios + cobertura |
| `make test-smoke` | Validacao rapida (~1s) |
| `make lint` | ESLint em todo src/ |
| `make format` | Prettier em todo src/ |
| `make doctor` | Diagnostico de saude do repo |
| `make setup` | Setup inicial completo |
| `make check` | Full check: lint + test + doctor |

---

## 📜 Licenca

[MIT](LICENSE) © 2026 Vibe Coding Template Repo Contributors

---

<p align="center">
  <b>Feito com 💜 pela comunidade de vibe coding</b><br>
  <i>"Clone, vibe, deploy."</i>
</p>
