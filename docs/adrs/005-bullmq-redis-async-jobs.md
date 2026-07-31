# ADR 005: Processamento Assíncrono e Eventos com BullMQ e Redis

- **Status:** Aceito
- **Data:** 2026-07-31

## Contexto

Tarefas pesadas, como varreduras completas de código ou auditorias de segurança estáticas, bloqueiam o loop de evento do Node.js se executadas de forma síncrona na requisição HTTP.

## Decisão

Implementar **BullMQ** sobre o **Redis** para gerenciamento de filas de tarefas de background.
O fluxo de auditoria grava o log inicial via Prisma em estado `PENDING` e enfileira a tarefa no worker dedicado. O worker processa os escaneamentos e atualiza o estado final para `COMPLETED` ou `FAILED`.

## Consequências

- **Positivas:** API HTTP responde em tempo constante (< 50ms) com status `202 Accepted` enquanto o trabalho pesado roda em background.
- **Negativas:** Requer instância Redis operacional.
