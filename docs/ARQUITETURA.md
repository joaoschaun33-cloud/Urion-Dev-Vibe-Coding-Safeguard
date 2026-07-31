# 🏗️ Arquitetura do Sistema — Urion Dev Vibe Coding Safeguard

> **Modelo C4 + STRIDE Threat Model + Regras de Rastreabilidade SDD**

---

## 1. C4 Model

### Nível 1: Contexto de Sistema

```mermaid
C4Context
  Person(dev, "Desenvolvedor / Solo Founder", "Constrói software utilizando assistentes de IA (Cursor, Antigravity, Copilot)")
  System(urion, "Urion Safeguard Platform", "Impõe Dogma Zero, FSD, SDD e detecção de secrets estática em 1 segundo")
  System_Ext(ai, "Assistente de IA (LLM)", "Gera código, refatorações e testes unitários")
  System_Ext(github, "GitHub CI/CD Actions", "Executa validações de pipeline e bloqueia PRs sem provas do Vitest")

  Rel(dev, ai, "Envia prompts e especificações SDD")
  Rel(ai, urion, "Gera código em src/ seguindo regras .mdc / AGENTS.md")
  Rel(urion, github, "Gera evidências de auditoria e relatórios de saúde em .urion/")
  Rel(github, dev, "Aprova ou Bloqueia o Pull Request com RFC 7807")
```

---

### Nível 2: Container (Visão da Plataforma)

```mermaid
C4Container
  Container_Boundary(app, "Urion Safeguard Infrastructure") {
    Component(web, "Dashboard Web (React 18 + Vite)", "Interface visual Dark Mode com estatísticas de saúde e specs em tempo real", "Porta 5173 / urion.ia.br")
    Component(cli, "Doctor CLI (Node.js AST)", "Scanner estático de 1 segundo que valida AST, secretos e violações FSD", "tools/cursor-doctor.js")
    Component(api, "Backend API (Express + TS)", "API REST que fornece diagnósticos de saúde e gestão de specs SDD", "Porta 3000")
    ComponentDb(db, "Prisma ORM (SQLite / Postgres)", "Armazena relatórios de auditoria e especificações SDD rastreáveis", "prisma/dev.db")
  }

  Rel(web, api, "Lê relatórios de /api/v1/project-health e /api/v1/specs")
  Rel(cli, db, "Registra execuções de auditoria")
  Rel(api, db, "Consulta e grava estados de saúde e especificações")
```

---

## 2. Threat Model (STRIDE Framework)

| Categoria | Ameaça Identificada | Mitigação no Urion Safeguard |
| :--- | :--- | :--- |
| **Spoofing** | IA inventa que testes rodaram e passaram sem executá-los. | **Dogma Zero**: Exige log de saída e cobertura real do Vitest antes do merge. |
| **Tampering** | Injeção de código malicioso via Markdown/PRD externo. | **Tratamento Passivo**: Prompt Injections em docs são isolados e desarmados. |
| **Repudiation** | Desenvolvedor alega que "foi a IA que quebrou a produção". | **Spec-Driven Traceability**: Tags `@implements US-*` conectam o autor ao commit. |
| **Information Disclosure** | Hardcoding de API Keys, JWT Tokens ou `.env` em `src/`. | **Doctor AST Scanner**: Bloqueia segredos em menos de 1 segundo via AST. |
| **Denial of Service** | Alucinação criando loops N+1 ou arquivos gigantes (>300 linhas). | **Linter de Arquiteturas FSD**: Limita arquivos a 300 linhas max. |
| **Elevation of Privilege** | Importação cruzada ilegal de domínios privados (`features/auth` ↔ `payment`). | **Isolamento FSD**: Módulos de domínio não podem importar infra/apresentação. |

---

## 3. Decisões Arquiteturais Gravadas (ADRs)

- **ADR-001: Dogma Zero de Honestidade Absoluta**: A IA nunca pode inventar status de teste ou omitir erros.
- **ADR-002: Adotação Estrita de Feature-Sliced Design (FSD)**: Organização em `domain`, `application`, `infrastructure`, `presentation`.
- **ADR-003: Validação Estática sem Sobrecarga de Runtime**: AST rápido via Node.js local sem dependências de serviços externos.
