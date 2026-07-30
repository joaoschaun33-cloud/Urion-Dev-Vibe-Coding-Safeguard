# Monitoring & Observability

> O sistema fala. Voce so precisa ouvir. Configure observabilidade desde o inicio.

---

## 📊 Tres Pilares da Observabilidade

### 1. Logs (O que aconteceu)
- Formato: JSON estruturado
- Campos obrigatorios: `timestamp`, `level`, `traceId`, `message`, `service`
- Niveis: `debug` (dev), `info` (normal), `warn` (recuperavel), `error` (falha), `fatal` (crash)
- Nunca logue PII (CPF, senha, token) em nivel info ou abaixo

### 2. Metricas (Como esta acontecendo)
- Latencia: p50, p95, p99 de endpoints
- Throughput: requests/min, jobs/min
- Errors: taxa de erro por endpoint, por tipo
- Recursos: CPU, memoria, disco, conexoes de banco

### 3. Traces (Onde esta acontecendo)
- Distributed tracing: cada request tem um `traceId` unico
- Propagacao entre servicos via headers
- Visualizacao: Jaeger, Zipkin, ou Datadog APM

---

## 🚨 Alertas

| Alerta | Condicao | Severidade | Acao |
|--------|----------|------------|------|
| Error Rate Spike | > 1% errors em 5min | P1 | PagerDuty + rollback |
| Latency Degradation | p95 > 500ms por 10min | P2 | Investigar + scale |
| Memory Leak | Memoria crescendo > 20% em 1h | P2 | Reiniciar + investigar |
| Disk Full | > 85% uso | P1 | Limpar logs + expandir |
| DB Connections | > 80% pool | P2 | Aumentar pool + otimizar queries |

---

## 🛠️ Ferramentas Recomendadas

| Categoria | Ferramenta | Proposito |
|-----------|------------|-----------|
| Logs | Winston/Pino (Node), structlog (Python) | Logging estruturado |
| Metricas | Prometheus + Grafana | Coleta e visualizacao |
| Traces | Jaeger, Zipkin, Datadog | Distributed tracing |
| Erros | Sentry | Tracking de excecoes |
| APM | Datadog, New Relic | Performance monitoring |
| Uptime | UptimeRobot, Pingdom | Health checks externos |

---

## 🏥 Health Checks

```typescript
// Endpoint de health check
app.get('/health', (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    disk: checkDiskSpace(),
  };

  const isHealthy = Object.values(checks).every(c => c.status === 'up');

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

---

## 📈 Dashboards

### Must-Have
1. **Traffic**: requests/min, status codes, top endpoints
2. **Errors**: error rate, top errors, error trend
3. **Performance**: latency percentiles, slowest endpoints
4. **Resources**: CPU, memoria, disco, rede
5. **Business**: usuarios ativos, conversoes, revenue (se aplicavel)
