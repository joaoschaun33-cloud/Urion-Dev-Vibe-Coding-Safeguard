# Vibes.md — Memória de Longo Prazo e Guia Visual do Projeto

> Este arquivo captura a "vibe" do projeto: decisões de estilo, preferências de UX/UI, diretrizes de frontend e lições aprendidas. A IA deve ler isto para manter consistência cultural e estética.

---

## 🎨 Vibe Visual (Frontend & UI)

### 1. Tom de Voz & Estética Geral

- **Tom de voz**: Profissional, encorajador, transparente e direto ao ponto. Sem jargões obscuros para o criador não-técnico.
- **Estética**: **Dark Mode Premium por padrão**. Design limpo, moderno, inspirado em ferramentas de alta performance (Linear, Vercel, Raycast). Vidromorfismo sutil e sombras suaves.

### 2. Paleta de Cores (Design System Tokens)

- **Fundo Principal (Background)**: `#090D16` (Deep Space Dark)
- **Superfícies/Cards**: `#111827` (Charcoal Slate com bordas discretas `#1F2937`)
- **Cor Primária (Accent/Brand)**: `#8B5CF6` (Vibrant Electric Violet / Purple)
- **Status & Indicadores**:
  - 🟢 **Saúde Excelente / Sucesso**: `#10B981` (Emerald Green)
  - 🟡 **Aviso / Alerta**: `#F59E0B` (Amber Gold)
  - 🔴 **Crítico / Erro**: `#EF4444` (Coral Red)
  - 🔵 **Informação / Neutro**: `#3B82F6` (Royal Blue)
- **Texto**:
  - Primário: `#F9FAFB` (High contrast crisp white)
  - Secundário: `#9CA3AF` (Muted cool gray)

### 3. Tipografia

- **Fontes Primárias**: `Inter` ou `Outfit` (Sans-Serif moderna, legível em alta densidade de dados).
- **Código / Métricas**: `JetBrains Mono` ou `Fira Code` para números de diagnósticos, scripts e tokens.

### 4. Animações & Micro-Interações

- **Duração**: Transições sutis (≤200ms a 300ms), curva `ease-out`.
- **Efeitos Hover**: Elevação leve de cards (`translate-y-0.5`), realce de bordas brilhantes.
- **Interatividade**: Feedback tátil imediato em botões de ação ("Executar Doctor", "Gerar Feature").

---

## 🧠 Vibe de Código

- Prefira **clareza sobre inteligência estéril**. O código deve ser compreensível por um desenvolvedor júnior ou criador não-técnico.
- Comentários explicam o **PORQUÊ** de uma decisão, não o óbvio.
- Nomes descritivos > nomes curtos. `getProjectHealthScore` > `getScore`.
- Respeite rigorosamente o isolamento por camadas no Feature-Sliced Design (FSD).

---

## 🔄 Vibe de Processo

- **Iterações curtas e focadas**: Trabalhar em ciclos de 15-20 minutos.
- **Commit frequente**: Commits atômicos e descritivos por funcionalidade.
- **Revisão Obrigatória**: Nenhuma alteração entra na main sem passar pelos testes de sanidade (`make check` / `cursor-doctor`).

---

## 🐛 Lições Aprendidas (Memory Log)

- **2026-07-30**: Importação de `node:crypto` explicita e suporte de chavetas nos blocos de fluxo de controle previne rejeições pelo ESLint.
- **2026-07-30**: Em métodos assíncronos de repositórios em memória que satisfazem interfaces com Promises, o uso de `Promise.resolve(...)` garante conformidade estrita com o linter TypeScript.

---

## 🎯 Diretrizes para IA

- Sempre consulte este arquivo ao propor interfaces visuais ou componentes de UI.
- NUNCA crie interfaces simples ou genéricas com estilos nativos do navegador.
- Utilize cores da paleta definida e ofereça feedback visual imediato para ações do usuário.
