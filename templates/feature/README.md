# Template de Feature (FSD)

Use o gerador em vez de copiar manualmente:

```
npm run generate:feature -- <nome-em-kebab-case>
# ex.: npm run generate:feature -- user-profile
```

O gerador substitui os tokens (`__Name__`, `__name__`, `__slug__`, `__NAME__`) e cria,
em `src/features/<nome>/`, uma feature que **ja nasce compilando e testavel**, com um
repositorio EM MEMORIA como padrao (sem depender de banco).

## Estrutura gerada

```
src/features/<feature>/
├── domain/
│   ├── <feature>.ts                       # entidade + schema Zod
│   ├── <feature>-repository.interface.ts  # port
│   └── errors.ts
├── application/
│   ├── create-<feature>.ts                # use case
│   └── dto/
│       ├── create-<feature>.dto.ts        # entrada (Zod)
│       └── <feature>-response.dto.ts      # saida + mapper
├── infrastructure/
│   └── <feature>-repository.memory.ts     # adapter em memoria (troque por Prisma depois)
└── tests/
    └── unit/
        └── create-<feature>.test.ts
```

## Proximos passos apos gerar

1. Ajuste os campos reais em `domain/<feature>.ts` e no DTO.
2. Registre a rota em `src/app/routes.ts` (use `asyncHandler`).
3. Para persistir em banco: crie o modelo no `prisma/schema.prisma` e troque o repo
   em memoria por uma implementacao Prisma (referencia: feature `todo`).
4. Rode: `npm run build && npm run lint && npm test`.
