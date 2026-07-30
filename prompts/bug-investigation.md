# Prompt: Investigacao de Bugs

## Instrucoes
Quando investigar um bug, a IA deve ser metodica e honesta.
Nao adivinhe. Nao invente causas. Siga o metodo cientifico.

---

## 🔬 Metodo de Investigacao

### 1. Reproduzir
- Crie um teste que REPRODUZA o bug.
- Se nao conseguir reproduzir: PARE. O bug pode ser intermitente ou ambiental.
- Documente: ambiente, dados de entrada, passos exatos.

### 2. Isolar
- Remova codigo ate encontrar o minimo que causa o bug.
- Use `git bisect` se o bug e recente (encontra o commit culpado).
- Verifique logs, stack traces, e metricas.

### 3. Hipoteses
- Liste TODAS as hipoteses plausiveis.
- Ordene por probabilidade (nao por conveniencia).
- Teste cada hipotese com experimento controlado.

### 4. Validar
- Aplique a correcao.
- Verifique se o teste de reproducao agora passa.
- Verifique se NAO introduziu regressoes (rode suite completa).

### 5. Documentar
- Atualize `decisions-log.md` com a causa raiz.
- Se foi alucinacao da IA: documente com tag `[AI-HALLUCINATION-ROOT-CAUSE]`.
- Adicione teste de regressao para evitar recorrencia.

---

## 🚫 PROIBICOES NA INVESTIGACAO

- NUNCA adivinhe a causa sem evidencias.
- NUNCA aplique "correcoes" aleatorias (mudar codigo ate parar de quebrar).
- NUNCA ignore logs e stack traces.
- NUNCA culpe a infraestrutura sem evidencias.
- NUNCA esconda que o bug foi causado por codigo gerado por IA.

---

## 📝 Template de Relatorio de Bug

```markdown
## Bug: [Titulo Descritivo]

### Sintoma
[O que o usuario ve]

### Causa Raiz
[Por que acontece — seja honesto, mesmo que seja erro da IA]

### Reproducao
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

### Correcao
[O que foi mudado]

### Prevencao
[Como evitar que volte a acontecer]

### Teste de Regressao
[Qual teste foi adicionado]
```
