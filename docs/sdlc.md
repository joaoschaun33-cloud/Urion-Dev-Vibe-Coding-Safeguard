# SDLC — Software Development Life Cycle

> Ciclo de vida de desenvolvimento que a IA DEVE seguir. Não pule etapas.

---

## 🔁 Fases do SDLC

### 1. ESPECIFICAR (Specify)

**Antes de escrever código:**

- [ ] Leia `00-context/vision.md`, `prd.md`, e `feature-spec.md` relevantes.
- [ ] Confirme entendimento: "Vou implementar [X] que faz [Y] porque [Z]. Correto?"
- [ ] Identifique dependências e bloqueios.
- [ ] Estime complexidade: Simples / Média / Complexa.

**Output**: Comentário de confirmação + plano de implementação.

---

### 2. PLANEJAR (Plan)

**Antes de codar:**

- [ ] Liste arquivos que serão criados/modificados.
- [ ] Defina contratos (DTOs, interfaces, tipos) primeiro.
- [ ] Planeje testes: quais casos de borda cobrir?
- [ ] Verifique se há regras em `.cursor/rules/` aplicáveis.

**Output**: Lista de arquivos + contratos + plano de testes.

---

### 3. IMPLEMENTAR (Implement)

**Durante a codificação:**

- [ ] Siga AGENTS.md e regras `.mdc` aplicáveis.
- [ ] Escreva código em pequenos passos verificáveis.
- [ ] Commit frequente (a cada passo funcional).
- [ ] Nunca deixe código quebrado no meio da sessão.

**Output**: Código funcional, compilando/lintando.

---

### 4. AUTO-REVISAR (Self-Review)

**Antes de considerar pronto:**

- [ ] Execute `npm run lint` e corrija erros.
- [ ] Execute `npm run test:smoke` — deve passar.
- [ ] Execute `npm run cursor-doctor` — deve passar.
- [ ] Revise seu próprio código: há duplicação? Nomes claros? Tratamento de erro?
- [ ] Verifique se não violou nenhum dogma de AGENTS.md.

**Output**: Código revisado, lintado, testado.

---

### 5. PREPARAR PR (Prepare PR)

**Antes de abrir Pull Request:**

- [ ] Atualize `decisions-log.md` se houver decisão arquitetural nova.
- [ ] Atualize `vibes.md` se aprendeu algo novo.
- [ ] Escreva descrição de PR clara: o que mudou, por que mudou, como testar.
- [ ] Linke issues/tickets relacionados.
- [ ] Garanta que CI passará (lint, testes, security scan).

**Output**: PR pronto para revisão humana.

---

## ⚠️ Regras de Ouro

1. **Nunca pule a fase de Especificar.** Entender mal o problema é a causa #1 de retrabalho.
2. **Nunca comite código quebrado.** A main deve estar sempre verde.
3. **Documente decisões.** Se gastou mais de 10 min decidindo algo, registre no decisions-log.md.
