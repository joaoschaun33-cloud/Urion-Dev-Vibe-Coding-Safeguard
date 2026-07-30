# Template: Nova Feature

Copie esta pasta para `src/features/<nome-da-feature>/` e adapte.

## Estrutura
```
src/features/<feature>/
├── domain/
│   ├── entity.ts
│   ├── repository.interface.ts
│   └── errors.ts
├── application/
│   ├── use-case.ts
│   ├── dto/
│   │   ├── input.dto.ts
│   │   └── output.dto.ts
│   └── mapper.ts
├── infrastructure/
│   ├── repository.impl.ts
│   └── external-service.client.ts
├── presentation/
│   ├── controller.ts
│   ├── component.tsx
│   └── hook.ts
└── tests/
    ├── unit/
    │   └── use-case.test.ts
    └── integration/
        └── repository.test.ts
```
