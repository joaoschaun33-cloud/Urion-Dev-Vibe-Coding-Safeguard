# Multi-Stack — Usando este template com outras tecnologias

> Este template nasceu com Node/TS/Express, mas a BIBLIA (regras, processos, honestidade) funciona com QUALQUER stack.

---

## 🐍 Python + FastAPI

### Adaptacoes

#### 1. Estrutura FSD
```
src/features/<feature>/
├── domain/          # Pydantic models, regras puras
├── application/     # Services (use cases)
├── infrastructure/  # SQLAlchemy/Django ORM repositories
└── presentation/    # FastAPI routers/controllers
```

#### 2. Regras `.mdc`
Crie `.cursor/rules/python-backend.mdc`:
```yaml
---
description: Regras para Python/FastAPI
globs: ["*.py"]
alwaysApply: true
---

# Python Backend

## Framework
- FastAPI para APIs REST
- Pydantic para validacao
- SQLAlchemy 2.0 (declarative) para ORM
- pytest para testes

## Regras
- Type hints obrigatorios
- async/await para I/O
- Dependency injection com FastAPI Depends
- Nunca use `**kwargs` sem documentar
```

#### 3. package.json → pyproject.toml
```toml
[tool.poetry]
name = "vibe-app"
version = "1.0.0"

[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.111"
uvicorn = "^0.30"
sqlalchemy = "^2.0"
pydantic = "^2.7"

[tool.poetry.group.dev.dependencies]
pytest = "^8.2"
black = "^24.4"
ruff = "^0.5"
```

#### 4. Scripts
```bash
# Makefile
make dev:
	uvicorn src.app.main:app --reload

make test:
	pytest --cov=src --cov-report=term-missing

make lint:
	ruff check src/
	black --check src/

make format:
	ruff check --fix src/
	black src/
```

---

## 🦫 Go + Gin

### Adaptacoes

#### 1. Estrutura FSD
```
src/features/<feature>/
├── domain/          # Structs, interfaces
├── application/     # Use cases (funcs puras)
├── infrastructure/  # GORM/sqlx repositories
└── presentation/    # Gin handlers
```

#### 2. Regras `.mdc`
```yaml
---
description: Regras para Go/Gin
globs: ["*.go"]
alwaysApply: true
---

# Go Backend

## Framework
- Gin para HTTP
- GORM ou sqlx para ORM
- go-playground/validator para validacao
- testify para testes

## Regras
- Interfaces para repositories (ports)
- Error handling explicito (nao ignore erros!)
- Context.Context em toda funcao async
- Nunca use panic() em producao
```

---

## ⚡ Rust + Axum

### Adaptacoes

#### 1. Estrutura FSD
```
src/features/<feature>/
├── domain/          # Structs, traits
├── application/     # Use cases
├── infrastructure/  # sqlx/sea-orm repositories
└── presentation/    # Axum handlers
```

#### 2. Regras `.mdc`
```yaml
---
description: Regras para Rust/Axum
globs: ["*.rs"]
alwaysApply: true
---

# Rust Backend

## Framework
- Axum para HTTP
- sqlx ou SeaORM para ORM
- validator crate para validacao
- tokio para async

## Regras
- Result<T, E> em vez de exceptions
- Traits para repositories (ports)
- Arc<Mutex<T>> para estado compartilhado
- Nunca use unwrap() em producao
```

---

## 🐘 PHP + Laravel

### Adaptacoes

#### 1. Estrutura FSD
```
src/features/<feature>/
├── domain/          # Models, rules
├── application/     # Services, DTOs
├── infrastructure/  # Eloquent repositories
└── presentation/    # Controllers, Resources
```

---

## 📝 Checklist de Adaptacao

Para qualquer stack:
- [ ] Criar regra `.mdc` especifica
- [ ] Adaptar `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml`
- [ ] Adaptar scripts do `Makefile`
- [ ] Adaptar `docker-compose.yml` (se necessario)
- [ ] Manter `AGENTS.md` e `honesty.mdc` INALTERADOS
- [ ] Manter FSD + Clean Architecture
- [ ] Manter smoke tests e cursor-doctor
- [ ] Manter CI/CD (adaptar comandos)

---

> **Lembrete**: A arquitetura e os dogmas sao universais. A implementacao muda, os principios nao.
