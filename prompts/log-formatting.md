# Prompt: Formatação de Logs Estruturados

## Contexto
Todo log no projeto deve seguir formato JSON estruturado para integração com ferramentas de observabilidade.

## Template de Log
```typescript
import { logger } from '@/shared/infrastructure/logger';

logger.info({
  event: 'USER_REGISTERED',
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
  traceId: context.traceId,
});
```

## Regras
1. Sempre inclua `event` (snake_case, descritivo).
2. Sempre inclua `timestamp` em ISO 8601.
3. Sempre inclua `traceId` para rastreabilidade.
4. NUNCA logue dados sensíveis (senhas, tokens, CPF).
5. Use níveis apropriados: `debug` (dev), `info` (fluxo normal), `warn` (recuperável), `error` (falha).

## Exemplo de Uso
```
// ❌ Ruim
console.log("Usuário cadastrado: " + user.email);

// ✅ Bom
logger.info({ event: 'USER_REGISTERED', userId: user.id, email: user.email, timestamp: ..., traceId: ... });
```
