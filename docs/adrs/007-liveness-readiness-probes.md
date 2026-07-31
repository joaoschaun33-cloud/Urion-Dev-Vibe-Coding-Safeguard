# ADR 007: Padronização de Probes de Saúde (Liveness e Readiness) para Kubernetes

- **Status:** Aceito
- **Data:** 2026-07-31

## Contexto

Ambientes orquestrados em contêineres (Kubernetes, AWS ECS) exigem diagnósticos diferenciados entre o estado de vida da aplicação (processo aceitando requisições) e o estado de prontidão para receber tráfego de produção (dependências de banco e cache operacionais).

## Decisão

Implementamos a separação explícita de Health Check Probes seguindo padrões internacionais de resiliência:

1. **`/health/live` (Liveness Probe):** Responde `200 OK` se o loop de eventos do Node.js estiver responsivo. Usado pelo orquestrador para saber se precisa reiniciar o contêiner.
2. **`/health/ready` (Readiness Probe):** Executa consultas em tempo real (`SELECT 1` no PostgreSQL via Prisma e `PING` no Redis). Retorna `200 OK` apenas quando todos os serviços estão funcionais ou `503 Service Unavailable` em estado degradado.
3. **`/health/deep`:** Mantido como um alias compatível para inspeção diagnóstica detalhada de tempo de resposta.

## Consequências

- Previne que o roteador de carga envie tráfego para instâncias recém-iniciadas antes da conexão com banco e cache estar pronta.
- Garante isolamento rápido de falhas sem causar reinícios desnecessários de contêineres ativos.
