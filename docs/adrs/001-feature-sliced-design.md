# ADR 001: Adoção da Arquitetura Feature-Sliced Design (FSD)

- **Status:** Aceito
- **Data:** 2026-07-31

## Contexto

Projetos acelerados por assistentes de IA (Vibe Coding) tendem a acumular alto débito técnico rapidamente quando organizados por pastas puramente funcionais (`controllers/`, `services/`, `models/`), resultando em acoplamento circular e violações de limites de domínio.

## Decisão

Adotamos o padrão **Feature-Sliced Design (FSD)** adaptado para backend Node.js / TypeScript.
Cada módulo de funcionalidade é encapsulado dentro de `src/features/<feature-name>` contendo as 4 camadas bem delimitadas:

1. `domain/`: Entidades de negócio pura, value objects e interfaces de repositório sem dependência de framework.
2. `application/`: Casos de uso (Use Cases) e regras de orquestração de aplicação.
3. `infrastructure/`: Implementações concretas de repositórios (Prisma, Redis), clientes HTTP externos e adaptadores.
4. `presentation/`: Controllers HTTP Express, validadores Zod e schemas de entrada/saída.

## Consequências

- **Positivas:** Isolamento de testes de unidade puro na camada de domínio sem mockar bancos; substituição trivial de adaptadores de infraestrutura.
- **Negativas:** Requer disciplina estrita para evitar importações cruzadas entre features sem utilizar a camada `shared/`.
