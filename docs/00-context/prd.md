# PRD.md — Product Requirements Document

> **Vibe Coding Safeguard & Product Owner Template**  
> Documento vivo de requisitos do produto.

---

## 📋 Histórico de Versões

| Versão | Data       | Autor            | Alterações                                                          |
| ------ | ---------- | ---------------- | ------------------------------------------------------------------- |
| 1.0.0  | 2026-07-30 | Vibe Coding Team | Definição dos Requisitos Fundamentais de Salvaguarda de Arquitetura |

---

## 1. Contexto & Problema

Desenvolvedores e criadores não-técnicos usam assistentes de IA para construir produtos digitais a partir do zero. No início (prototipagem), a velocidade é alta. Porém, conforme o projeto cresce, a ausência de arquitetura estrita provoca o **Architectural Drift (desvio arquitetural)**:

- A IA esquece regras passadas.
- Quebra funcionalidades antigas sem avisar.
- Mistura regras de negócio com rotas e banco de dados.
- O criador não-técnico perde o controle do projeto, gerando abandono e frustração.

Este repositório atua como o **escudo arquitetural e metodológico** que impede este colapso.

---

## 2. Requisitos Funcionais (RF)

### RF-001: Dogma Zero e Protocolo de Honestidade Absoluta

- **Descrição**: O repositório deve impor regras inquebráveis de conduta para qualquer IA através dos arquivos `AGENTS.md` e `.cursor/rules/honesty.mdc`.
- **Critérios de Aceite**:
  - A IA admite quando não sabe ou quando uma instrução é ambígua.
  - A IA nunca afirma que um código funciona sem rodar testes.
  - A IA nunca expõe credenciais ou esconde erros.
- **Prioridade**: Must

### RF-002: Arquitetura Isolada Feature-Sliced Design (FSD)

- **Descrição**: O código deve ser organizado estritamente por módulos funcionais em `src/features/<feature>/` contendo as camadas: `domain`, `application`, `infrastructure` e `presentation`.
- **Critérios de Aceite**:
  - A camada de `domain` não depende de nenhuma biblioteca externa.
  - Nenhuma feature pode importar diretamente a lógica interna de outra feature sem passar pela camada `shared`.
- **Prioridade**: Must

### RF-003: Ferramenta de Diagnóstico Automatizado (`cursor-doctor`)

- **Descrição**: O sistema deve possuir um script executável de 1 segundo para verificar a integridade de regras, infraestrutura, testes e arquivos.
- **Critérios de Aceite**:
  - Comando `npm run cursor-doctor` retorna 0 erros quando o repositório está saudável.
  - Exibe diagnóstico amigável com emojis de status para usuários não-técnicos.
- **Prioridade**: Must

### RF-004: Gerador Automático de Features CLI

- **Descrição**: Fornecer um script CLI cross-platform para criar o esqueleto de novas funcionalidades sem exigência de conhecimento arquitetural do usuário.
- **Critérios de Aceite**:
  - Execução de `npm run generate:feature <nome>` cria todas as pastas e arquivos de template em `src/features/<nome>`.
- **Prioridade**: Must

### RF-005: Formato Padronizado de Erros (RFC 7807)

- **Descrição**: Toda resposta de erro da API deve seguir o padrão RFC 7807 (Problem Details).
- **Critérios de Aceite**:
  - Respostas HTTP com erro contêm `type`, `title`, `status`, `detail` e `instance`.
- **Prioridade**: Should

---

## 3. Requisitos Não-Funcionais (RNF)

- **Sanidade Rápida**: Testes de fumaça (`make test-smoke`) devem rodar em menos de 2 segundos.
- **Cobertura de Código**: Pelo menos 80% de cobertura de testes unitários para novos arquivos.
- **Leveza de Dependências**: Usar bibliotecas consolidadas e maduras (Node.js 20+, Express, Prisma, Zod, Vitest).

---

## 4. Riscos & Mitigações

| Risco                                                     | Probabilidade | Impacto | Mitigação                                                                        |
| --------------------------------------------------------- | ------------- | ------- | -------------------------------------------------------------------------------- |
| A IA ignorar as regras do repositório                     | Média         | Alto    | Uso de `.cursorrules`, `AGENTS.md` e pre-commit hooks (`husky` / `lint-staged`). |
| O usuário não-técnico não saber usar comandos de terminal | Média         | Médio   | Makefile simplificado com aliases curtos (`make dev`, `make check`).             |
