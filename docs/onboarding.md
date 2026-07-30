# Onboarding — Bem-vindo ao Projeto

> Guia para novos desenvolvedores (humanos ou IA) entrarem no projeto rapidamente.

---

## 🚀 Primeiros 15 Minutos

### 1. Leitura Obrigatoria
Leia nesta ordem:
1. `README.md` — visao geral do projeto
2. `AGENTS.md` — dogmas arquiteturais (ESPECIALMENTE Dogma Zero: Honestidade)
3. `.cursor/rules/honesty.mdc` — BIBLIA de honestidade da IA
4. `docs/architecture.md` — como o sistema funciona
5. `sdlc.md` — ciclo de vida de desenvolvimento

### 2. Setup do Ambiente
```bash
bash first-time.sh
```

### 3. Verifique a Saude
```bash
make doctor
make test-smoke
```

---

## 🏗️ Entendendo a Arquitetura

### Feature-Sliced Design (FSD)
```
src/
├── app/       ← Inicializacao, providers, routing
├── pages/     ← Paginas/rotas
├── features/  ← Modulos de negocio isolados
└── shared/    ← Codigo reutilizavel
```

**Regra de Ouro**: `domain` nao importa nada de fora.

### Como Adicionar uma Nova Feature
1. Copie `templates/feature/` para `src/features/<nome>/`
2. Preencha os arquivos seguindo os exemplos
3. Adicione testes em `tests/unit/` e `tests/integration/`
4. Registre a rota/controller em `app/routes.ts`

---

## 🧠 Como Trabalhar com a IA

### Contexto Essencial
Sempre mencione (`@`) estes arquivos no inicio da sessao:
- `@AGENTS.md`
- `@.cursor/rules/honesty.mdc`
- `@00-context/prd.md` (se trabalhando em feature especifica)

### Fluxo de Trabalho
1. Especifique o que precisa (use `00-context/feature-spec.md`)
2. A IA segue o SDLC: Especificar → Planejar → Implementar → Auto-Revisar → PR
3. Valide com `make check` antes de considerar pronto
4. Documente decisoes em `decisions-log.md`

---

## 📋 Convenções do Projeto

### Nomenclatura
- Arquivos: `kebab-case.ts`
- Classes: `PascalCase`
- Funcoes/variaveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Banco: `snake_case`

### Commits
Seguimos [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: adiciona autenticacao por OAuth
fix: corrige leak de memoria no cache
refactor: extrai validacao para schema
 docs: atualiza README com novos comandos
```

### Branches
- `main` — producao, sempre verde
- `develop` — integracao, sempre verde
- `feat/<nome>` — features
- `fix/<nome>` — correcoes
- `hotfix/<nome>` — correcoes urgentes em producao

---

## 🆘 Onde Pedir Ajuda

- **Duvida de arquitetura**: Leia `AGENTS.md` e `decisions-log.md`
- **Duvida de regras da IA**: Leia `.cursor/rules/*.mdc`
- **Bug em producao**: Siga `prompts/bug-investigation.md`
- **Deploy**: Siga `prompts/deployment.md`
- **Refatoracao**: Siga `prompts/refactor.md`

---

## ✅ Checklist de Onboarding

- [ ] Li `AGENTS.md` (especialmente Dogma Zero)
- [ ] Li `.cursor/rules/honesty.mdc`
- [ ] Rodei `first-time.sh` com sucesso
- [ ] Rodei `make doctor` e passou
- [ ] Rodei `make test-smoke` e passou
- [ ] Entendi a estrutura FSD
- [ ] Sei como criar uma nova feature usando `templates/feature/`
- [ ] Sei como mencionar contexto na IDE (`@arquivos`)
- [ ] Li `sdlc.md` e entendo o ciclo de desenvolvimento
