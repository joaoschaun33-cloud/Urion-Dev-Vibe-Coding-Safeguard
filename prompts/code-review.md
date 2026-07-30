# Prompt: Auto-Revisao de Codigo pela IA

## Instrucoes
Antes de entregar QUALQUER codigo, a IA DEVE executar esta revisao propria.
Este nao e opcional. E parte do SDLC (fase 4: Auto-Revisar).

---

## 🔍 Checklist de Revisao

### 1. Arquitetura e Design
- [ ] O codigo segue FSD (Feature-Sliced Design)?
- [ ] A logica de negocio esta na camada correta (domain/application)?
- [ ] Nao ha dependencias circulares?
- [ ] As interfaces (ports) estao definidas antes das implementacoes?

### 2. Qualidade de Codigo
- [ ] Nomes sao descritivos e seguem as convencoes do projeto?
- [ ] Funcoes tem responsabilidade unica (max 30 linhas ideal)?
- [ ] Nao ha codigo duplicado (DRY)?
- [ ] Early returns e guard clauses sao usados?
- [ ] Nao ha `any` ou tipos implicitos (TypeScript)?

### 3. Seguranca
- [ ] Nenhuma credencial hardcoded?
- [ ] Todas as entradas de usuario sao validadas?
- [ ] Nao ha SQL injection (ORM/prepared statements)?
- [ ] Nao ha XSS (escape de output)?
- [ ] Headers de seguranca estao presentes?

### 4. Performance
- [ ] Nao ha queries N+1?
- [ ] Listas tem paginacao?
- [ ] Nao ha memory leaks (listeners, conexoes)?
- [ ] Bundle size nao aumentou desnecessariamente?

### 5. Testes
- [ ] Testes unitarios cobrem casos felizes e tristes?
- [ ] Edge cases estao testados?
- [ ] Mocks sao apropriados (nao mockam demais)?
- [ ] Cobertura >= 80% para novos arquivos?

### 6. Acessibilidade (se frontend)
- [ ] Componentes sao acessiveis por teclado?
- [ ] Imagens tem alt?
- [ ] Contraste de cores e adequado?
- [ ] Formularios tem labels?

### 7. Documentacao
- [ ] Funcoes publicas tem JSDoc?
- [ ] Componentes tem exemplos/Storybook?
- [ ] APIs tem OpenAPI/Swagger?
- [ ] SUPOSICOES estao documentadas?

### 8. Honestidade (Dogma Zero)
- [ ] Eu testei este codigo? Se nao, admiti no output?
- [ ] Ha riscos ou trade-offs que ocultei?
- [ ] Inventei alguma referencia, API ou versao?
- [ ] Minha confianca esta calibrada corretamente?

---

## 📝 Formato do Relatorio de Revisao

A IA deve entregar um relatorio breve:

```
## Auto-Revisao: [Nome da Feature/Arquivo]

### ✅ Aprovado
- [Item que passou]

### ⚠️ Atenção
- [Item que precisa de olho humano]

### ❌ Bloqueante
- [Item que deve ser corrigido antes do merge]

### 🧪 Testes
- [O que foi testado e como]

### 📊 Nivel de Certeza
- ALTA / MEDIA / BAIXA / INCERTEZA TOTAL
- Justificativa: [por que]
```

---

> **Regra**: Se houver QUALQUER item bloqueante, a IA deve corrigir ANTES de considerar o codigo pronto.
