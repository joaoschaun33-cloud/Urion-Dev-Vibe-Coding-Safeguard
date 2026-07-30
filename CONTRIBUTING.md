# 🤝 Contribuindo com o Vibe Coding Template Repo

Obrigado pelo interesse em contribuir! Este projeto é da comunidade, para a comunidade.

---

## 🎯 Como Contribuir

### 1. Reportando Problemas

**Encontrou uma alucinação da IA?**
- Abra uma issue com o label `ai-hallucination`
- Descreva: qual IA usou (Cursor, Copilot, etc.), qual regra deveria ter impedido, e o que a IA gerou de errado

**Bug no template?**
- Abra uma issue com o label `bug`
- Inclua: passos para reproduzir, comportamento esperado vs atual, e logs se aplicável

**Sugestão de melhoria?**
- Abra uma issue com o label `enhancement`
- Explique o problema que resolve e como beneficiaria outros devs

### 2. Enviando Pull Requests

1. **Fork** o repositório
2. Crie uma **branch** descritiva: `feat/nova-regra-react`, `fix/correcao-smoke-test`
3. **Commit** com mensagens claras seguindo [Conventional Commits](https://www.conventionalcommits.org/)
4. **Teste** localmente:
   ```bash
   npm run test:smoke
   npm run cursor-doctor
   ```
5. Abra um **Pull Request** descrevendo:
   - O que mudou
   - Por que mudou
   - Como testar
   - Screenshots/logs se aplicável

### 3. Áreas de Contribuição

#### 🆕 Novas Regras `.mdc`
Quer adicionar suporte a um novo framework ou stack?

- Crie um arquivo em `.cursor/rules/<nome>.mdc`
- Siga o formato de frontmatter:
  ```yaml
  ---
  description: Descrição clara do que esta regra cobre
  globs: ["*.ext", "pasta/**/*.ext"]
  alwaysApply: true | false
  ---
  ```
- Inclua exemplos de código bom vs ruim
- Documente no README.md

**Frameworks desejados:**
- Svelte / SvelteKit
- Django / FastAPI (Python)
- Ruby on Rails
- Laravel (PHP)
- Flutter / React Native
- Rust (Actix, Axum)

#### 📚 Documentação
- Melhore `README.md`, `AGENTS.md`, ou templates em `00-context/`
- Traduções para outros idiomas
- Tutoriais e guias de uso

#### 🔧 Automação
- Novos scripts em `tools/`
- Melhorias no `cursor-doctor.js`
- Novos smoke tests em `checks/`
- Integrações MCP em `.mcp/`

#### 🐛 Correções
- Fix de bugs nos scripts
- Correções de segurança
- Melhorias de performance nos checks

---

## 📋 Code of Conduct

- Seja respeitoso e inclusivo
- Aceite feedback construtivo
- Foque no que é melhor para a comunidade
- Respeite diferentes opiniões e experiências

---

## 🏷️ Labels de Issue

| Label | Descrição |
|-------|-----------|
| `ai-hallucination` | IA gerou código que viola as regras |
| `bug` | Algo está quebrado no template |
| `enhancement` | Nova feature ou melhoria |
| `documentation` | Melhorias na docs |
| `good first issue` | Bom para quem está começando |
| `framework-support` | Suporte a novo framework/stack |
| `security` | Questões de segurança |

---

## 💬 Comunidade

- Discussions no GitHub para ideias gerais
- Issues para bugs e alucinações específicas
- Pull Requests para contribuições de código

---

## 📝 Nota sobre Revisão Humana

> Mesmo que este projeto seja sobre vibe coding com IA, **revisão humana é obrigatória** para todos os PRs.
>
> A IA pode gerar código, mas apenas humanos podem julgar se ele faz sentido no contexto real do projeto.

---

Obrigado por contribuir! 🚀
