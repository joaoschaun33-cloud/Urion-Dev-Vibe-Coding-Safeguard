# Architecture — Arquitetura do Sistema

> Visao geral da arquitetura e decisoes tomadas.

---

## Visao Geral

Este projeto segue **Clean Architecture** + **Feature-Sliced Design (FSD)**.

```
┌─────────────────────────────────────┐
│  Presentation  (React/Controllers)  │
├─────────────────────────────────────┤
│  Application   (Use Cases/DTOs)     │
├─────────────────────────────────────┤
│  Domain        (Entidades/Regras)   │
├─────────────────────────────────────┤
│  Infrastructure (DB/APIs/External)  │
└─────────────────────────────────────┘
```

## Principios

1. **Independencia de Frameworks**: O dominio nao conhece React, Express, ou Prisma.
2. **Testabilidade**: Regras de negocio sao testaveis sem banco, sem HTTP, sem UI.
3. **Independencia de UI**: Pode trocar React por Vue sem tocar no dominio.
4. **Independencia de Banco**: Pode trocar PostgreSQL por MongoDB sem tocar no dominio.
5. **Independencia de External**: APIs externas sao adaptadas, nao dependidas.

## Fluxo de Dados

```
Request → Controller → UseCase → Repository → Database
              ↓
        ResponseDTO ← Domain Entity
```

## Decisoes Arquiteturais (ADRs)

Veja `decisions-log.md` para o registro completo de decisoes.

| Data | Decisao | Status |
|------|---------|--------|
| 2026-07-28 | Adotar FSD | Aceita |
| 2026-07-28 | Adotar RFC 7807 para erros | Aceita |
| 2026-07-28 | Adotar Honestidade como Dogma Zero | Aceita |
