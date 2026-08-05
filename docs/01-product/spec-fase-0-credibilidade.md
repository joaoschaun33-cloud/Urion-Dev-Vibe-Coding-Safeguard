# Feature Spec — Fase 0: Credibilidade

> Segue `docs/00-context/feature-spec.md`. SDLC (`docs/sdlc.md`).
> **STATUS: DECISÕES 1–4 APROVADAS pelo PO em 2026-08-03 (opções recomendadas).
> Fases ESPECIFICAR + PLANEJAR concluídas neste doc. Próximo: IMPLEMENTAR (aguarda
> "pode implementar").**
> Ref.: `docs/01-product/roadmap.md` (Fase 0), `docs/research/dogfooding-urion.md`.
> Nível de certeza: ALTA no problema; MÉDIA nas soluções propostas (aguardam sua call).

---

## 🎯 Feature: Fase 0 — Eliminar overclaims e falso verde

### Contexto

O dogfooding provou que o próprio Urion emite alegações falsas: passa este repo como
"100% blindado" com 18% de cobertura, anuncia um comando `fix` inexistente, cita uma
estatística sem fonte e mantém regras duplicadas em 4 arquivos. Como a marca do
produto é honestidade (Dogma Zero), isso é dívida crítica. A Fase 0 remove essa
dívida com mudanças baratas — e conserta o próprio repositório.

Restrição de projeto: partes rodam via `npx urion-safeguard` (zero-setup, CommonJS
em `bin/`). Qualquer mudança não pode quebrar o caminho zero-install.

---

## Escopo (4 itens) e Requisitos (critérios de aceite)

### 0.1 — Remover/alinhar o comando `fix`

Hoje `bin/lib/mode-maker.cjs` e o README anunciam
`npx urion-safeguard fix --rule=...`, mas **não há handler `fix`** no dispatcher.

❓**DECISÃO 1:** implementar o `fix` de verdade (esforço maior, risco de auto-fix
incorreto) **ou** remover o anúncio agora e mover "auto-fix real" para o backlog?
*Proposta (recomendada):* **remover o anúncio** nesta fase; auto-fix vira backlog só
após precisão comprovada.

- [ ] Nenhuma saída do CLI ou texto do README anuncia `fix` enquanto ele não existir.
- [ ] Onde hoje sugere `fix`, o texto passa a orientar a correção manual (a
      `recomendacaoLeiga` já existe em cada regra).
- [ ] Se a DECISÃO for implementar: `command === 'fix'` tratado no dispatcher, com
      pelo menos 1 regra auto-fixável funcionando e teste.

### 0.2 — Corrigir/citar a estatística "92%"

README afirma "92% dos apps de IA contêm vulns graves"; as fontes atribuem 92% à
*preocupação de líderes de segurança*, não a apps vulneráveis (números reais ~45–62%).

❓**DECISÃO 2:** substituir por número correto **com fonte** ou remover a estatística?
*Proposta (recomendada):* substituir por dado citável (ex.: "~45% do código gerado por
IA introduz falhas conhecidas — fonte X") com link.

- [ ] Toda estatística no README/CLI tem fonte verificável (link) ou é removida.
- [ ] Nenhuma linguagem de certeza absoluta sem respaldo (dogma `honesty.mdc`).

### 0.3 — Matar o "falso verde" (o item de maior impacto)

`bin/lib/scanner-engine.cjs` calcula `healthScore` só por presença de governança e
declara "EXCELENTE / 100% blindado" ignorando a cobertura (18%).

❓**DECISÃO 3:** qual limite reprova o veredito? *Proposta:* o status **não** pode ser
"EXCELENTE/blindado" se cobertura estimada < 80% (dogma do projeto) **ou** se houver
qualquer issue CRITICAL. Nesses casos, status máximo = "ATENÇÃO".

- [ ] Rodar `scanner` neste repo NÃO retorna "100% blindado" com cobertura 18%.
- [ ] O veredito nunca contradiz uma métrica exibida na mesma tela.
- [ ] O score de governança e o de qualidade (cobertura/vulns) são apresentados sem
      se anularem (não misturar "presença" com "seguro").
- [ ] Teste cobre: projeto com governança completa + cobertura baixa → "ATENÇÃO".

### 0.4 — Fonte única das regras VIBE_GUARD

`VIBE_GUARD_RULES` está duplicada em 4 arquivos com regex divergentes:
`bin/lib/mode-maker.cjs`, `src/.../domain/vibe-guard-rules.ts`,
`src/.../application/scan-vibe-guard.ts`, `src/mcp/urion-mcp-server.ts`.

❓**DECISÃO 4:** onde fica a fonte canônica, dado o zero-install do `.cjs`?
*Proposta:* fonte canônica em `src/.../domain/vibe-guard-rules.ts`; um script de build
gera o arquivo `.cjs` de regras consumido por `bin/` (mantém npx self-contained);
`scan-vibe-guard.ts` e o MCP importam do domain. Sem duplicação manual.

- [ ] `grep -r "SECRET_KEY_PATTERN\|VIBE_GUARD_RULES"` aponta 1 definição-fonte.
- [ ] CLI, MCP e camada TS consomem a mesma fonte (direta ou gerada).
- [ ] `npx urion-safeguard vibeguard` continua funcionando sem instalar nada.

---

## Design Técnico

- **Camadas envolvidas**: `bin/` (CLI CommonJS), `src/features/security-audit`
  (domain/application), `src/mcp`, `scripts/` (gerador de regras), `README.md`.
- **Entidades novas**: nenhuma. É correção + refactor + ajuste de veredito.
- **Endpoints novos**: nenhum.
- **Componentes UI**: nenhum (saída de terminal ajustada).

---

## Dependências

- [ ] Aprovação do PO nas DECISÕES 1–4.
- [ ] Nenhuma biblioteca nova prevista (a confirmar após PLANEJAR).

---

## Critérios de Pronto (Definition of Done)

- [ ] Código seguindo AGENTS.md e `honesty.mdc`.
- [ ] Testes unitários (≥80%) para o novo veredito (0.3) e para a fonte única (0.4).
- [ ] `npm run lint`, `npm run test:smoke`, `npm run cursor-doctor` passando.
- [ ] Dogfooding: rodar as 3 ferramentas neste repo e **nenhuma** emitir alegação
      falsa (é o teste de aceite da fase inteira).
- [ ] README/CLI sem overclaim; documentação atualizada.
- [ ] Revisão (humana ou IA) + relatório de honestidade com nível de certeza.

---

## Notas para a IA

- Preservar o caminho zero-install do `npx` — não introduzir dependência em `bin/`.
- Reusar `recomendacaoLeiga` já existente nas regras para o texto de correção manual.
- Não misturar "presença de governança" com "código seguro" no veredito.
- Seguir o SDLC: só ir para PLANEJAR após as DECISÕES 1–4 aprovadas.

---

# PLANEJAR (Plan)

> Decisões aprovadas: 1=remover anúncio do `fix`; 2=substituir 92% por ~45% com
> fonte Veracode; 3=cap de veredito por cobertura <80% ou CRITICAL; 4=fonte única
> via dado canônico + geração do artefato consumido pelo `bin/`.
> Fonte da estatística (0.2), verificada na página:
> Veracode — "45% of AI-generated code contains security flaws"
> (https://www.veracode.com/blog/ai-generated-code-security-risks/).

## Arquivos a criar / modificar

| Ação | Arquivo | O quê |
| --- | --- | --- |
| MOD | `bin/lib/mode-maker.cjs` | Remover a linha que anuncia `npx urion-safeguard fix --rule=...` (l.152). O texto de correção passa a ser só a `recomendacaoLeiga` já exibida em "🛠️ Como resolver". |
| MOD | `README.md` | Trocar a frase dos "92%" (l.9) por dado citável (~45%) com link Veracode. |
| SWEEP | repo todo | `grep` por `fix --rule`, `Correção Automática`, `1 Clique`, `92%` em `README.md`, `docs/`, `QUICKSTART.md`, `bin/` e limpar resíduos. |
| CRIA | `bin/lib/verdict.cjs` | Funções puras `computeEstimatedCoverage` e `deriveStatus` (lógica do veredito). |
| MOD | `bin/lib/scanner-engine.cjs` | Consumir `verdict.cjs`; aplicar cap; só imprimir "100% blindado" se `shielded`. |
| CRIA | `src/features/security-audit/domain/vibe-guard-rules.data.json` | Payload canônico das regras (fonte única). |
| MOD | `src/features/security-audit/domain/vibe-guard-rules.ts` | Passar a montar `VIBE_GUARD_RULES` a partir do JSON canônico (remove o hack `p1..p5`). |
| CRIA | `scripts/sync-vibe-guard-rules.mjs` | Gera `bin/lib/vibe-guard-rules.generated.cjs` a partir do JSON. |
| MOD | `bin/lib/mode-maker.cjs` + `src/mcp/urion-mcp-server.ts` + `.../application/scan-vibe-guard.ts` | Consumir a fonte única (gerado no `bin/`, JSON/TS no `src/`). |
| MOD | `package.json` | Script `sync:rules:guard`; hook em `build`/`prepublishOnly`; garantir que o `.generated.cjs` seja publicado (checar campo `files`/`.npmignore`). |
| CRIA | `bin/lib/tests/verdict.test.ts` | Testes do veredito. |
| CRIA | `src/features/security-audit/tests/unit/rules-source.test.ts` | Garante TS e artefato `.cjs` em sincronia + regex compila. |
| MOD | `checks/smoke.test.js` (ou novo teste) | Aceite da fase: rodar `scanner` neste repo NÃO retorna "blindado" com cobertura <80%. |

## Contratos (definidos antes de codar)

```
// bin/lib/verdict.cjs
computeEstimatedCoverage({ codeFiles: number, testFiles: number }): number  // 0..100; codeFiles=0 => 0

deriveStatus(input: {
  healthScore: number,            // score de governança (presença)
  estimatedCoveragePct: number,
  criticalCount: number,
  coverageThreshold?: number      // default 80 (dogma AGENTS.md)
}): {
  status: 'EXCELENTE' | 'BOM' | 'ATENCAO' | 'CRITICO',
  capped: boolean,                // true se rebaixado por qualidade
  reason: string | null,          // ex.: "Cobertura 18% < 80% exigido"
  shielded: boolean               // true só se EXCELENTE && !capped  → libera "100% blindado"
}
```

```
// vibe-guard-rules.data.json (schema de cada item)
{
  "id": "SECRETS_HARDCODED",
  "severity": "CRITICAL" | "WARNING" | "INFO",
  "regexSource": "string",   // corpo da regex
  "regexFlags": "i",
  "title": "string",
  "descriptionLeiga": "string",
  "riscoReal": "string",
  "recomendacaoLeiga": "string",
  "autoFixable": true
}
```

Regra do cap (0.3): `status` não pode exceder `ATENCAO` se
`estimatedCoveragePct < coverageThreshold` **ou** `criticalCount > 0`.

## Plano de testes (casos de borda)

- `computeEstimatedCoverage`: codeFiles=0 → 0; arredondamento; testFiles>codeFiles.
- `deriveStatus`: (100, 18, 0) → ATENCAO, capped, shielded=false, reason preenchida;
  (100, 85, 0) → EXCELENTE, shielded=true; (100, 80, 0) fronteira → EXCELENTE;
  (100, 90, 1) → ATENCAO (CRITICAL), capped.
- `rules-source`: ids do TS == ids do `.generated.cjs`; toda `regexSource` compila;
  padrão SECRET casa `sk_live_...` e (documentar) risco de FP em string longa genérica.
- smoke/aceite: `node bin/urion-safeguard.cjs scanner` neste repo → status `ATENCAO`
  e ausência da string "100% blindado".

## Riscos / trade-offs (Dogma Zero)

- **Precisão do regex NÃO é escopo da Fase 0** — só dedupe. O `{20,}` do SECRET segue
  com risco de falso positivo; endereçado em fase posterior. Declarado, não escondido.
- **Passo de geração** adiciona risco de drift; mitigado pelo teste `rules-source` +
  hook em `build`/`prepublishOnly`.
- **Empacotamento npm**: se `package.json` tiver `files` restritivo, o
  `.generated.cjs` precisa estar incluído — verificar antes de publicar.
- Manter saída ASCII-safe (compat PowerShell, conforme histórico do repo).

## Dependências e ferramentas

- Sem libs novas previstas. Verificar globs do Vitest para posicionar os testes onde
  são coletados (`vitest.config.ts`).
- Substituição declarada (Dogma Zero): usarei Node/Vitest/ESLint/Git base; nenhuma
  skill/MCP externa é necessária para esta fase.

## Certeza

ALTA no escopo e contratos; MÉDIA no detalhe de empacotamento npm (a confirmar ao
implementar 0.4).
