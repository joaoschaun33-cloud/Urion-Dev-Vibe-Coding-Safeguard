# Prompt: Preparacao para Deploy

## Instrucoes
Deploy nao e apenas `git push`. E um processo que exige validacao rigorosa.

---

## ✅ Checklist Pre-Deploy

### 1. Codigo
- [ ] Branch `main` esta verde (CI passando).
- [ ] Nao ha commits diretos em `main` (tudo via PR).
- [ ] CHANGELOG.md atualizado.
- [ ] Versao bumpada (semver: major.minor.patch).

### 2. Banco de Dados
- [ ] Migrations foram testadas em staging.
- [ ] Rollback plan documentado.
- [ ] Backup do banco antes do deploy (producao).
- [ ] Nao ha migrations destrutivas sem janela de manutencao.

### 3. Feature Flags
- [ ] Features novas estao atras de feature flag?
- [ ] Flag pode ser desligada rapidamente se houver problema?

### 4. Monitoramento
- [ ] Logs estruturados estao configurados.
- [ ] Alertas de erro (Sentry, Datadog, etc.) estao ativos.
- [ ] Dashboards de performance estao prontos.
- [ ] Health check endpoint funciona.

### 5. Rollback
- [ ] Estrategia de rollback definida (blue-green, canary, ou revert rapido).
- [ ] Tempo maximo de rollback: < 5 minutos.
- [ ] Banco e compativel com versao anterior (backward compatible migrations).

---

## 🚀 Estrategias de Deploy

| Estrategia | Quando Usar | Risco |
|------------|-------------|-------|
| **Blue-Green** | Deploys frequentes, zero downtime | Medio (dupla infra) |
| **Canary** | Mudancas arriscadas, validacao gradual | Baixo (rollback rapido) |
| **Rolling** | Cluster grande, tolerancia a falha parcial | Medio |
| **Recreate** | Prototipos, ambientes de dev | Alto (downtime) |

---

## 📊 Pos-Deploy

- Monitore logs por 30 minutos.
- Verifique metricas criticas: error rate, latency, throughput.
- Esteja pronto para rollback imediato.
- Comunique ao time: deploy concluido, metricas estaveis.
