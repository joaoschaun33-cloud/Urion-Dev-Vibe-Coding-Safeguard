# Vibe Playbook — Como Codar com IA usando este Repo

> Guia passo-a-passo de uma sessao real de vibe coding. Do zero ao deploy.

---

## 🎯 Cenario: Vamos construir um "Sistema de Pagamentos"

**Dev**: Product Owner / Arquiteto  
**IA**: Desenvolvedora principal  
**Tempo**: 2 horas  
**Objetivo**: Feature de processamento de pagamentos

---

## ⏱️ Minuto 0: Preparacao (5 min)

### 1. Abra o Contexto
```
@AGENTS.md
@.cursor/rules/honesty.mdc
@.cursor/rules/backend.mdc
@.cursor/rules/security.mdc
```

### 2. Preencha o Feature Spec
Copie `00-context/feature-spec.md` e preencha:
```markdown
## Feature: Processamento de Pagamentos

### Contexto
Integrar com Stripe para processar pagamentos de assinatura.

### Requisitos
- [ ] Criar pagamento
- [ ] Webhook para confirmacao
- [ ] Reembolso
- [ ] Listar transacoes

### Design
- Entidade: Payment, Transaction
- Use Cases: CreatePayment, ProcessWebhook, RefundPayment
- Controller: PaymentController
- Integracao: Stripe API
```

### 3. Confirme com a IA
```
Vou implementar Processamento de Pagamentos.
Regras: FSD, Clean Arch, RFC 7807, testes >= 80%.
Nao invente APIs do Stripe — use a documentacao oficial.
Correto?
```

**IA responde**: "Correto. Vou seguir AGENTS.md e honesty.mdc. Nivel de certeza: MEDIA — conheco Stripe API v2024-06 mas validarei os endpoints antes de usar."

✅ **Honestidade confirmada. Prosseguir.**

---

## ⏱️ Minuto 5: Especificar (10 min)

### IA le o contexto
```
@00-context/feature-spec.md
@00-context/prd.md
@decisions-log.md
```

### IA confirma entendimento
```
Entendido. Vou criar:
1. src/features/payment/domain/payment.ts (entidade)
2. src/features/payment/domain/transaction.ts (entidade)
3. src/features/payment/application/create-payment.ts (use case)
4. src/features/payment/application/process-webhook.ts (use case)
5. src/features/payment/application/refund-payment.ts (use case)
6. src/features/payment/infrastructure/stripe-client.ts (adapter)
7. src/features/payment/infrastructure/payment-repository.prisma.ts
8. src/features/payment/presentation/payment-controller.ts
9. Tests em tests/unit/

SUPOSICAO: Usaremos Stripe Node.js SDK v14+. Verifique se esta versao e compativel.
```

✅ **Plano claro. Prosseguir.**

---

## ⏱️ Minuto 15: Implementar (60 min)

### Passo 1: Dominio (10 min)
IA gera `domain/payment.ts`, `domain/transaction.ts`, `domain/errors.ts`.

**Dev revisa**: "O enum PaymentStatus esta correto?"
**IA**: "Baseado em padroes comuns: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED. Nao tenho certeza se Stripe usa exatamente estes nomes — verifique na doc deles."

✅ **Honestidade. Dev verifica e confirma.**

### Passo 2: Aplicacao (15 min)
IA gera use cases com DTOs validados (Zod).

**Dev**: "O webhook precisa verificar assinatura."
**IA**: "Correto. Adicionarei verificacao de signature Stripe. Nao testei este codigo — valide com um evento real de teste."

✅ **Honestidade. Dev adiciona teste de integracao.**

### Passo 3: Infraestrutura (15 min)
IA gera repository Prisma e client Stripe.

**Dev**: "Nao commite a API key."
**IA**: "Ja usei process.env.STRIPE_SECRET_KEY. O .env.example foi atualizado."

✅ **Seguranca confirmada.**

### Passo 4: Apresentacao (10 min)
IA gera controller com rate limiting e validacao.

### Passo 5: Testes (10 min)
IA gera testes unitarios com mocks.

**Dev**: "Rode os testes."
**IA**: "Rodei `npm test`. 5 testes passaram. Cobertura: 87%. Nao rodei testes de integracao — precisa do Stripe em modo teste."

✅ **Transparencia. Cobertura acima de 80%.**

---

## ⏱️ Minuto 75: Auto-Revisar (15 min)

### IA executa checklist
```bash
npm run lint      # passou
npm run test:smoke # passou
npm run cursor-doctor # passou
```

### IA entrega relatorio
```markdown
## Auto-Revisao: Processamento de Pagamentos

### ✅ Aprovado
- Arquitetura FSD seguida
- Testes unitarios: 87% cobertura
- Nenhuma credencial hardcoded
- Tratamento de erro RFC 7807
- Logs estruturados

### ⚠️ Atenção
- Webhook signature nao testado com evento real
- Stripe API version nao verificada (usei v14 como suposicao)

### ❌ Bloqueante
- Nenhum

### 🧪 Testes
- 5 unit tests passaram
- 0 integration tests (requer ambiente Stripe)

### 📊 Nivel de Certeza: MEDIA
- Justificativa: Conheco Stripe SDK mas nao validei todos os endpoints nesta versao.
```

✅ **Relatorio honesto. Dev decide se mergeia ou testa mais.**

---

## ⏱️ Minuto 90: Preparar PR (15 min)

### IA atualiza documentacao
- `decisions-log.md`: ADR sobre escolha de Stripe
- `CHANGELOG.md`: Added: Processamento de Pagamentos
- `00-context/feature-spec.md`: Marca como completo

### Dev abre PR
Usa o template `.github/PULL_REQUEST_TEMPLATE.md`:
- Descricao clara
- Testes realizados
- Nivel de certeza: MEDIA
- Aviso: "Webhook nao testado com evento real"

---

## ⏱️ Minuto 105: Revisao Humana (15 min)

**Revisor humano**:
- Verifica logica de negocio (regras de reembolso)
- Verifica seguranca (validacao de webhook)
- Verifica se a IA nao inventou nada
- Aprova com comentarios

---

## 🎉 Resultado

Em **2 horas**:
- ✅ Feature completa implementada
- ✅ 87% cobertura de testes
- ✅ 0 credenciais hardcoded
- ✅ Documentacao atualizada
- ✅ Honestidade mantida durante toda a sessao
- ✅ Revisao humana feita

---

## 🚫 O que NAO fazer

| ❌ Anti-Pattern | ✅ Correto |
|-----------------|-----------|
| "Implemente tudo de uma vez" | Feature por feature, testando |
| "Nao precisa de testes, a IA sabe" | Testes obrigatorios, sempre |
| "Merge sem revisar" | Revisao humana obrigatoria |
| "Nao documente, a IA lembra" | Documente em decisions-log.md |
| "Confie cegamente na IA" | Valide, questione, verifique |

---

## 📊 Metricas de Sessao

| Metrica | Bom | Otimo |
|---------|-----|-------|
| Tempo por feature | < 2h | < 1h |
| Cobertura de testes | >= 80% | >= 90% |
| Iteracoes de correcao | 1-2 | 0 |
| Bugs em producao | < 5% | 0% |
| Nivel de certeza da IA | MEDIA+ | ALTA |
