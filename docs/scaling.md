# Scaling — Escalabilidade

> Como fazer o sistema crescer sem quebrar.

---

## 📈 Estrategias de Escalabilidade

### Horizontal (Mais Maquinas)
- Stateless: nada de sessao em memoria local
- Load balancer: distribui requests entre instancias
- Auto-scaling: baseado em CPU, memoria, ou fila

### Vertical (Maquina Maior)
- Mais CPU/RAM para a mesma instancia
- Limitado pelo hardware maximo
- Use como ultimo recurso

### Database
- Read replicas: queries de leitura vao para replicas
- Sharding: divide dados por chave (user_id, regiao)
- Connection pooling: nao exceda capacidade do banco
- Cache: Redis para dados frequentes

### Cache Estrategico
```
Browser → CDN → Load Balancer → App Cache → Database
```
- **Browser**: Cache-Control, ETag
- **CDN**: CloudFlare, AWS CloudFront (assets estaticos)
- **App**: Redis (dados dinamicos, TTL explicito)
- **Database**: Query cache, indices

---

## 🏗️ Arquitetura para Escala

### Microservices (quando necessario)
- Quebre quando: time > 10 pessoas, deploy independente necessario
- Nao quebre quando: time pequeno, complexidade nao justifica
- Comunicacao: event-driven (Kafka, RabbitMQ) ou gRPC

### Event-Driven
- Producers publicam eventos
- Consumers processam assincronamente
- Idempotencia: consumer deve lidar com eventos duplicados

### CQRS (quando necessario)
- Commands: escritas, validacao, logica de negocio
- Queries: leituras otimizadas, projeções, cache
- Nao use CQRS em CRUD simples — overkill

---

## 🧪 Testes de Carga

```bash
# k6 — teste de carga
k6 run --vus 100 --duration 30s load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('https://api.exemplo.com/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

---

## 📊 Quando Escalar?

| Metrica | Acao |
|---------|------|
| CPU > 70% por 5min | Scale horizontal (+1 instancia) |
| Memoria > 80% | Investigar leak ou scale vertical |
| Latencia p95 > 500ms | Otimizar queries ou adicionar cache |
| Fila > 1000 jobs | Adicionar workers ou otimizar processamento |
| DB connections > 80% | Aumentar pool ou adicionar read replica |
| Error rate > 1% | Rollback e investigar |
