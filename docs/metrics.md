# Metrics — Medindo o Sucesso do Vibe Coding

> Voce nao gerencia o que nao mede. Aqui estao as metricas que importam.

---

## 🎯 Metricas de Produtividade

### 1. Velocity (Velocidade)
**O que**: Story points / features entregues por sprint.  
**Meta**: Mesma ou maior que desenvolvimento tradicional.  
**Como medir**: GitHub Projects, Jira, ou planilha simples.

### 2. Lead Time
**O que**: Tempo desde "ideia" ate "em producao".  
**Meta**: < 3 dias para features pequenas.  
**Como medir**: `git log --first-parent --format="%H %ai %s"`

### 3. Tempo de Sessao
**O que**: Quanto tempo uma sessao de vibe coding dura.  
**Meta**: 15-25 minutos por iteracao.  
**Por que**: Sessoes muito longas = fadiga, erros. Sessoes muito curtas = contexto perdido.

---

## 🛡️ Metricas de Qualidade

### 4. Cobertura de Testes
**O que**: % de codigo coberto por testes.  
**Meta**: >= 80% para novos arquivos.  
**Como medir**: `npm run test -- --coverage` (Vitest/Istanbul)

### 5. Bug Escape Rate
**O que**: % de bugs encontrados em producao vs total de bugs.  
**Meta**: < 5%.  
**Como medir**: Sentry / GitHub Issues tag `production-bug`.

### 6. Revert Rate
**O que**: % de PRs revertidos.  
**Meta**: < 2%.  
**Como medir**: `git log --grep="Revert" --oneline | wc -l`

### 7. Nivel de Certeza da IA
**O que**: Quao honesta a IA esta sendo.  
**Meta**: 90% das respostas com certeza ALTA ou MEDIA (com trade-offs documentados).  
**Como medir**: Auditoria manual de 10% das sessoes.

---

## 🧠 Metricas da IA

### 8. Alucinacoes Detectadas
**O que**: Quantas vezes a IA inventou API, versao, ou comportamento.  
**Meta**: 0 por sprint.  
**Como medir**: Issues com label `ai-hallucination`.

### 9. Contexto Perdido
**O que**: Quantas vezes a IA "esqueceu" uma decisao arquitetural.  
**Meta**: 0.  
**Como medir**: Revisar se `decisions-log.md` e `vibes.md` sao consultados.

### 10. Tempo de Onboarding
**O que**: Tempo para um novo dev/IA ser produtivo.  
**Meta**: < 30 minutos.  
**Como medir**: `docs/onboarding.md` + `first-time.sh`.

---

## 📊 Dashboard de Metricas

```markdown
## Sprint X — Resumo

| Metrica | Valor | Meta | Status |
|---------|-------|------|--------|
| Velocity | 24 pts | 20 pts | 🟢 |
| Lead Time | 2.3 dias | < 3 dias | 🟢 |
| Cobertura | 84% | >= 80% | 🟢 |
| Bug Escape | 3% | < 5% | 🟢 |
| Revert Rate | 1% | < 2% | 🟢 |
| Alucinacoes | 0 | 0 | 🟢 |

**Saude do Projeto: 🟢 EXCELENTE**
```

---

## 🚨 Alertas

| Situacao | Acao |
|----------|------|
| Cobertura < 70% | Pare e escreva testes |
| Bug Escape > 10% | Revise processo de revisao |
| Alucinacoes > 2/sprint | Revise regras `.mdc` |
| Revert Rate > 5% | Aumente rigor de CI |
| Lead Time > 1 semana | Quebre features em partes menores |
