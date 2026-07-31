# ADR 002: Injeção de Dependências com Awilix Container

- **Status:** Aceito
- **Data:** 2026-07-31

## Contexto

Instanciar controllers e use cases manualmente cria dependências acopladas de infraestrutura (ex: `new PrismaTodoRepository()`) diretamente nas rotas ou construtores, dificultando mocks em testes e substituições de adaptadores.

## Decisão

Utilizar o **Awilix DI Container** em modo `CLASSIC` para registrar e resolver todas as dependências como singletons.
A configuração centralizada em `src/app/container.ts` garante que cada use case receba o repositório correto sem que a camada de apresentação (`presentation/`) conheça a infraestrutura concreta (`infrastructure/`).

## Consequências

- **Positivas:** Desacoplamento completo entre rotas Express e infraestrutura; facilidade em injetar adaptadores alternativos sem alterar lógica de aplicação.
- **Negativas:** Requer tipagem rigorosa dos tipos de container para garantir _type safety_ com TypeScript strict mode.
