# 🎨 Especificação de Design System & UX do Dashboard e Badge "Urion Verified"

> **Missão:** Criar uma experiência visual de padrão Big Tech (FAANG-Grade) que cause impactoimediato (**Efeito WOW**), devolva o orgulho e a credibilidade ao Vibe Coder / Maker No-Code, e forneça um selo auditável interativo.

---

## 💎 1. Diretrizes de Estética & Design System

### Palette de Cores (Dark Mode Neon & Glassmorphism)

- **Background Principal:** `#090D16` (Deep Charcoal Blue)
- **Superfície Cards / Glass:** `rgba(17, 24, 39, 0.7)` com `backdrop-filter: blur(16px)` e borda `rgba(255, 255, 255, 0.08)`
- **Acento Primário (Safeguard Purple):** `#8B5CF6` / Gradient `linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)`
- **Acento Segurança (Emerald Success):** `#10B981` / Gradient `linear-gradient(135deg, #10B981 0%, #059669 100%)`
- **Acento Alerta (Amber Warning):** `#F59E0B`
- **Texto Principal:** `#F9FAFB` (High Contrast White)
- **Texto Secundário:** `#9CA3AF` (Muted Metallic Gray)

---

## 🛡️ 2. Anatomia da Badge "Urion Verified" (Selo de Confiança)

O selo **Urion Verified** é oferecido em 4 variações visuais para que o maker possa embutir em qualquer site (Bubble, Webflow, React, WordPress):

### Variações do Widget:

1. **Shield Badge (Compacta):** Ícone de escudo roxo/verde + texto _"Protected by Urion Safeguard"_. Ideal para rodapé.
2. **Score Badge (Métricas):** Exibe a nota ao vivo (ex: `100/100 SAFEGUARD SCORE`).
3. **Glassmorphic Card:** Card flutuante transparente com brilho suave e status dos últimos testes.
4. **Minimal Dark Tag:** Tag minimalista para projetos SaaS profissionais.

### Comportamento Interativo (Modal Auditável Ao Vivo):

Quando qualquer usuário clica no selo embutido, abre-se um **Modal de Auditoria Pública** com:

- **Status do Deploy:** `PASSING / 100% HEALTHY`
- **Última Varredura:** Data e Hash do Commit.
- **Relatório de Cobertura:** AST Real, Dogma Zero, No-Code Scanners (n8n/Make/OpenAPI).
- **Assinatura Criptográfica de Validação.**

---

## 📊 3. Arquitetura dos Componentes do Dashboard Web

O Dashboard principal do Urion é estruturado nas seguintes seções:

### A. Hero Metric Header (Score de Confiança)

- **Score Animado (0 a 100):** Contador numérico fluido com barra circular de progresso em gradiente esmeralda.
- **Indicador de Saúde Geral:** Tags de estado (`FAANG-GRADE`, `SAFEGUARD ACTIVE`).

### B. Live Terminal & Doctor Stream

- Simulador visual de execução do `cursor-doctor` e `smoke tests` em tempo real.

### C. No-Code & AST Security Breakdown (Cards de Cobertura)

- **Card 1: AST Code Audit** (Zero `console.log`, zero credenciais vazadas).
- **Card 2: No-Code & Declarative Scanner** (Scans de n8n, Make, OpenAPI e YAML/JSON).
- **Card 3: Dogma Zero Honesty Evaluator** (Status de testes reais vs. stubs enganosos).

### D. Badge Customizer & Embed Code Generator

- Seletor interativo da badge desejada (com preview ao vivo).
- Copiador em 1 clique de snippet `HTML/IFRAME` e componente `React`.

---

## 🚀 4. Próximos Passos de Implementação (Web Frontend)

1. Atualizar e polir o componente [LandingPage.tsx](file:///c:/dev/Product-owner/product-owner-open-source-repositorio/web/src/components/LandingPage.tsx).
2. Criar os componentes isolados:
   - `web/src/components/UrionBadge.tsx` (Widget da Badge e Gerador de Embed).
   - `web/src/components/AuditModal.tsx` (Modal de Verificação Pública Ao Vivo).
3. Validar a renderização visual do frontend com testes e preview do Vite.
