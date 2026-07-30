# Prompt: Refatoracao Segura

## Instrucoes
Refatoracao muda a estrutura interna sem alterar comportamento externo.
Essa e uma operacao de alto risco. Siga rigorosamente.

---

## 🚫 PROIBICOES NA REFATORACAO

1. **Nunca refatore sem testes** — Se nao ha testes, ESCREVA testes primeiro.
2. **Nunca mude comportamento** — Se o comportamento mudar, nao e refatoracao.
3. **Nunca refatore e adicione feature ao mesmo tempo** — Um passo de cada vez.
4. **Nunca delete codigo sem entender por que existe** — Documente antes de remover.
5. **Nunca refatore em producao sem rollback plan** — Staging primeiro, sempre.

---

## ✅ PASSOS OBRIGATORIOS

### Passo 1: Inventario
- Liste todos os arquivos que serao afetados.
- Identifique dependencias externas (outros modulos, APIs, banco).
- Verifique se ha testes existentes. Se nao, PARE e escreva testes.

### Passo 2: Testes de Seguranca (Golden Master)
- Rode todos os testes existentes. Devem passar ANTES da refatoracao.
- Se houver testes de integracao/E2E que cobrem o fluxo: otimo.
- Se nao houver: escreva testes de caracterizacao (capturam comportamento atual).

### Passo 3: Refatoracao em Pequenos Passos
- Um commit por passo de refatoracao.
- Nomes de commit descritivos: `refactor: extrai funcao de validacao`, `refactor: renomeia variavel x para y`.
- Nunca mude mais de uma coisa por commit.

### Passo 4: Validacao Continua
- Apos CADA passo: rode os testes. Devem passar.
- Se quebrar: desfaca (git stash / revert) e tente de novo.

### Passo 5: Validacao Final
- Rode testes unitarios, integracao E smoke tests.
- Rode `cursor-doctor`.
- Verifique se nao ha regressoes de performance (benchmark se aplicavel).

---

## 🧪 Checklist Pre-Refatoracao

- [ ] Entendo completamente o que este codigo faz?
- [ ] Ha testes cobrindo o comportamento atual?
- [ ] Identifiquei todos os pontos de integracao?
- [ ] Tenho um plano de rollback?
- [ ] Vou refatorar em passos pequenos e verificaveis?

## 🧪 Checklist Pos-Refatoracao

- [ ] Todos os testes passam?
- [ ] Smoke tests passam?
- [ ] cursor-doctor passa?
- [ ] Nao ha mudancas de comportamento (verifique com stakeholder se necessario)?
- [ ] Documentacao foi atualizada (se nomes mudaram)?
- [ ] Performance nao regrediu?
