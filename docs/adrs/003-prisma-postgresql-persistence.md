# ADR 003: Persistência Relacional com Prisma ORM e PostgreSQL

- **Status:** Aceito
- **Data:** 2026-07-31

## Contexto

Dada a necessidade de garantir consistência ACID, integridade referencial e auditorias técnicas confiáveis sem perda de dados entre reinicializações do servidor, a utilização de repositórios temporários em memória (`InMemory`) deve ser restrita exclusivamente ao ambiente de testes de unidade.

## Decisão

Padronizar a persistência de produção do ecossistema Urion através do **Prisma ORM** integrado com **PostgreSQL**.
Todas as entidades do sistema (`Todo`, `ProjectHealthReport`, `SpecDocument`, `SecurityAuditLog`) agora possuem modelos mapeados no `prisma/schema.prisma` e repositórios concretos injetados via Awilix DI Container.

## Consequências

- **Positivas:** Migrações tipadas e versionadas no versionamento de código (`npx prisma migrate dev`), suporte a transações ACID (`prisma.$transaction`) e auditorias auditáveis.
- **Negativas:** Requer instância PostgreSQL rodando em produção (provisionada via Docker Compose ou Cloud SQL).
