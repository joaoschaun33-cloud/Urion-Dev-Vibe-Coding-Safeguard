# Decisions Log — Registro de Decisões Arquiteturais

> Documente TODAS as decisões arquiteturais significativas. A IA usa este arquivo para entender o "porquê" das escolhas.

---

## Formato

```
### [DATA] — [TÍTULO_DA_DECISÃO]

**Status**: Proposta / Aceita / Depreciada / Substituída
**Contexto**: [Qual problema estávamos resolvendo?]
**Decisão**: [O que decidimos fazer?]
**Consequências**:
- Positivas: [...]
- Negativas: [...]
**Alternativas consideradas**:
- [Alternativa 1] — rejeitada porque [...]
- [Alternativa 2] — rejeitada porque [...]
```

---

### 2026-07-28 — Uso de Feature-Sliced Design (FSD)

**Status**: Aceita
**Contexto**: Precisávamos de uma arquitetura que escale com múltiplos desenvolvedores (humanos e IAs) sem criar dependências circulares.
**Decisão**: Adotar FSD como padrão de organização de código.
**Consequências**:
- Positivas: Isolamento de features, clareza de dependências, fácil onboarding.
- Negativas: Curva de aprendizado inicial, mais pastas que MVC tradicional.
**Alternativas consideradas**:
- MVC — rejeitada porque mistura concerns e não escala bem.
- DDD puro — rejeitida porque muito verboso para projeto inicial.

---

### 2026-07-28 — RFC 7807 para Erros de API

**Status**: Aceita
**Contexto**: APIs precisavam de formato de erro padronizado para frontend consumir consistentemente.
**Decisão**: Adotar RFC 7807 (Problem Details) como padrão de resposta de erro.
**Consequências**:
- Positivas: Padronização, auto-documentação, compatibilidade com ferramentas.
- Negativas: Overhead de estrutura para erros simples.
**Alternativas consideradas**:
- JSON genérico `{ error: "msg" }` — rejeitado por falta de padronização.
- GraphQL errors — rejeitado porque usamos REST.

---

### [DATA] — [Próxima decisão]
[Adicione novas decisões aqui conforme o projeto evolui]
