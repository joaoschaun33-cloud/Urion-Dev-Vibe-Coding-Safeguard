# Checklist de Governança & Adoção: Haganah WAF (Da POC à Produção)

Este documento mapeia o roteiro de 5 fases para a adoção progressiva do WAF/Haganah em aplicações gerenciadas pelo Urion Safeguard.

---

## FASE 0: Decisão Go/No-Go — 30min

| Item | Responsável | Critério de Aceite | Por quê |
| :--- | :--- | :--- | :--- |
| **1. Stack compatível** | Dev | Node.js, Express/Fastify/Next.js (Node Runtime). | WAF não roda em Edge isolado hoje. |
| **2. Vetor de ataque mapeado** | PM/Sec | Mapear rotas críticas: `/api/v1/auth`, `/checkout`, `/upload`. | Foco em vazamento de dados e brute-force. |
| **3. Orçamento VIP** | PM | Definir se precisa SSRF, bot avançado ou schema validation. | Tier grátis cobre camada core. |
| **4. Política de logs** | Arquiteto | WAF não loga body/headers com PII. Redação via Pino ativa (`[REDACTED_PII]`). | Atende LGPD, GDPR, HIPAA §164.308. |

*Se 1 item falhar = não adota ainda.*

---

## FASE 1: POC Local & Safeguard Integration — 2h

| Item | Comando/Config | Validação |
| :--- | :--- | :--- |
| **1. Instalar & Doctor** | `npm install @haganah-waf/core` | `npm run cursor-doctor` valida integração sem quebrar FSD |
| **2. Modo Monitor** | `modo: 'monitor', aoDecidir: console.warn` | Log aparece mas req não bloqueia em dev local |
| **3. Teste SQLi** | `curl "localhost:3000?q=1' OR 1=1--"` | Log: `[waf] SERIA BLOQUEADO` |
| **4. Teste Rate Limit** | Limite: 5, janela: 60 + script de 10 reqs | Ação: `limitar` após 5ª requisição |
| **5. Teste Falso Positivo** | `npm test` + `npm run test:smoke` | **0 testes quebrados** por falso positivo |

*Critério pra Fase 2: 0 Falso Positivo + ≥1 ataque real seria bloqueado.*

---

## FASE 2: Staging / Homologação — 1 dia

| Item | Responsável | Critério de Aceite |
| :--- | :--- | :--- |
| **1. Redis Adapter** | Dev Sênior | Rate limit não reseta ao reiniciar o servidor PM2/Docker. |
| **2. Observabilidade** | SRE / DevOps | Eventos enviados ao logger Pino estruturado e APM. |
| **3. IP Real** | Dev | Configurar `cabecalhosIpReal: ['X-Forwarded-For']` sob Cloudflare/Nginx. |
| **4. Allowlist** | Sec | Adicionar IPs de CI/CD runners e healthchecks em `listaPermissao`. |
| **5. Load Test** | QA | `npm run test:smoke` + k6 com 1k RPS: p99 latência WAF < 10ms. |
| **6. Runbook & Feature Flag** | Arquiteto | Documentado `habilitado: false` via variável de ambiente de emergência. |

---

## FASE 3: Produção Canary — 3 dias

| Item | Config | Rollback |
| :--- | :--- | :--- |
| **1. 5% do Tráfego** | `modo: 'ativo'` em 5% dos nós | Toggle via env `WAF_CANARY_PERCENT=5` |
| **2. Dashboard & Alertas** | Painel de monitoramento de bloqueios por rota | Se bloqueio > 0.1% do tráfego legítimo, ativar bypass |
| **3. Ajuste de Regras** | Lista de regras desabilitadas justificadas por PR | Requer commit aprovado e auditado |
| **4. Rollout Gradual** | 5% → 25% → 50% → 100% a cada 24h | Pausar se taxa de erro 4xx/5xx subir > 2% |

---

## FASE 4: Hardening + Regras de Negócio — 1 semana

| Item | Frequência / Tier | Por quê |
| :--- | :--- | :--- |
| **1. Validação de Schema (Zod/ProblemDetails)** | Core | Bloqueia payloads gigantes/malformados na entrada. |
| **2. Reputação de IP & Anti-Bot** | Avançado | Bloqueia IPs conhecidos por botnets em rotas de auth. |
| **3. Alertas de Segurança em SECURITY.md** | Core | Reforçar: *"WAF não substitui validação de preço no banco de dados."* |

---

## FASE 5: Compliance & Governança Contínua

| Item | Frequência | Responsável |
| :--- | :--- | :--- |
| **1. Review de Regras Customizadas** | Mensal | Sec + Dev |
| **2. Auditar Logs LGPD / PII** | Mensal | DPO / Arquiteto (Verificar `logger.ts`) |
| **3. Validação com Cursor Doctor** | Por commit / PR | CI/CD automatizado no GitHub Actions |
