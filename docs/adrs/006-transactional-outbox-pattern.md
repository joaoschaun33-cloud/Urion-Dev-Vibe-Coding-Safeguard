# ADR 006: Transactional Outbox Pattern para Mensageria Resiliente

- **Status:** Aceito
- **Data:** 2026-07-31

## Contexto

Em arquiteturas orientadas a eventos de alto nível de exigência (Big Tech Grade), a escrita no banco de dados e a publicação de mensagens em filas de eventos (ex: BullMQ / Redis) devem ser tratadas de forma atômica. Chamadas assíncronas diretas após o commit da transação do banco correm o risco de perda de eventos se o processo for interrompido antes do envio para a fila.

## Decisão

Adotamos o **Transactional Outbox Pattern**:

1. Toda operação de gravação de dados que gera eventos de domínio salva o evento na tabela `outbox_events` dentro da **mesma transação do banco de dados relacional (Prisma)**.
2. Um serviço especializado de segundo plano (`OutboxPoller`) realiza varreduras periódicas em lotes em busca de eventos pendentes (`processedAt: null`).
3. Cada evento é despachado para o barramento in-process (`DomainEventBus`) e para a fila do BullMQ com garantia de entrega _at-least-once_.
4. Eventos não processados após falhas de workers são direcionados para a fila de descarte (`audit-dlq`) com suporte a _exponential backoff_.

## Consequências

- **Positivas:**
  - Garantia de consistência eventual sem dependência de transações distribuídas (2PC/XA).
  - Tolerância a falhas do serviço de Redis sem perda de dados.
- **Mitigações:**
  - Garantir idempotência nos consumidores de eventos de domínio.
