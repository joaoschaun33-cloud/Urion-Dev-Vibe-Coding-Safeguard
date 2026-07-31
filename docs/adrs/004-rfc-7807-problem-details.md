# ADR 004: Padronização de Respostas de Erro com RFC 7807 (Problem Details)

- **Status:** Aceito
- **Data:** 2026-07-31

## Contexto

Respostas de erro genéricas (`{ message: "Internal server error" }`) dificultam a depuração automática por agentes de IA e clientes frontend, escondendo o contexto e o correlation ID da requisição.

## Decisão

Adotar o padrão **RFC 7807 (Problem Details for HTTP APIs)** no middleware global de erros (`src/app/middleware/error-handler.ts`).
Todas as exceções lançadas na aplicação são interceptadas e convertidas no formato padronizado:

- `type`: URI identificando o tipo de erro.
- `title`: Título legível do erro de domínio.
- `status`: Código HTTP numérico (ex: 400, 404, 422, 500).
- `detail`: Detalhe da violação.
- `instance`: URI da rota onde a falha ocorreu.
- `requestId`: Headers `X-Request-ID` para rastreamento no log estruturado Pino.

## Consequências

- **Positivas:** Formato previsível e autodescritivo para integrações de API e leitores de IA.
- **Negativas:** Requer mapeamento explícito de exceções de domínio no middleware global.
