# Urion — Posicionamento & Estratégia

> Documento vivo. Autor: João Schaun (PO/Arquiteto) + Claude (dev sênior).
> Data-base: 2026-08-03. Nível de certeza global: MÉDIA (estratégia informada por
> pesquisa e leitura do código; não por validação com usuários reais ainda).

---

## 1. Tese central (uma frase)

**O Urion é o motor de governança que força o vibe coder a seguir, em tempo real,
o processo que separa os apps de IA que dão certo dos que vazam dados ou colapsam
— especificar antes de codar, gerar com guardrails, e não lançar sem revisão.**

Não somos um scanner. O scanner é _uma_ feature. Somos a camada que impede o
código ruim de nascer e que só libera o launch quando o app está sólido.

---

## 2. O problema real (com base em postmortems, não em achismo)

Os incidentes que derrubam apps vibe-coded não são exóticos — são de processo:

- **Segurança como afterthought.** 170+ apps do Lovable com banco totalmente
  exposto por falta de Row Level Security no Supabase; Base44 com endpoints sem
  autenticação; Tea app vazando 72 mil IDs e selfies; ~40% dos apps auditados
  expondo dados sensíveis.
- **Confiar em código gerado sem revisão.** A IA do Replit apagou um banco de
  produção com um comando não revisado.
- **Promptar sem especificar.** Causa nº1 de retrabalho e de app que "funciona na
  demo e quebra no volume real". 20 min de spec economizam 2 h de iteração.
- **Expectativa irreal** ("não preciso de expert") + testes cortados + ownership
  difuso.

Lição-mãe da pesquisa: _IA/low-code não remove complexidade, redistribui_ — dá
poder de construir mais rápido, logo poder de **errar** mais rápido. E a frase que
mais aparece nos casos de sucesso: **"a diferença entre sucesso e fracasso é se um
profissional revisa o código antes do lançamento."**

> Ponto crítico para nós: nenhum desses incidentes reais seria pego pelas 5 regex
> atuais. A dor mora em **configuração de plataforma** (RLS, auth, permissões) e em
> **processo** (spec, revisão) — não em um padrão de texto num `.js`.

---

## 3. O diferencial / categoria

Categoria em que jogamos: **camada de governança para desenvolvimento assistido por
IA** (prevenção em tempo de geração), não "mais um scanner de segurança".

O que nos torna defensáveis (o moat):

1. **Prevenção > detecção.** Interceptamos no momento em que a IA gera, não depois
   do estrago.
2. **Linguagem para não-devs.** Traduzimos risco técnico em consequência real
   ("isso pode gerar cobrança no seu cartão"). 63% dos usuários de vibe coding são
   não-desenvolvedores.
3. **Governança integrada que já existe.** `AGENTS.md`, `.cursor/rules/*.mdc`, SDD
   no `CLAUDE.md`, Dogma Zero. Isso é o produto — não o subproduto.
4. **Honestidade como marca.** Num setor cheio de overclaim, ser o que não mente
   sobre o que faz é posicionamento, não só ética.

**Mensagem central:** _"Urion — o profissional que revisa seu código de IA antes do
launch, em tempo real, na sua língua."_

---

## 4. Público e job-to-be-done

- **Primário:** vibe coders / makers no-code e low-code (Cursor, Lovable, Bolt, v0,
  Claude Code) que não sabem avaliar segurança nem arquitetura.
- **Secundário:** times pequenos/solo founders que usam IA para 80–95% do código e
  precisam de um "revisor" sem contratar um sênior.

**Job:** "Me garanta que o que a IA está construindo não vai me expor, quebrar ou
me envergonhar — sem eu precisar virar engenheiro."

---

## 5. O coração do produto: servidor MCP em tempo real

A decisão estratégica é fazer do **MCP guard em tempo real** o núcleo — o ponto onde
o Urion intercepta a geração dentro do editor (Cursor/Claude/Antigravity) e aplica
os gates _antes_ do código entrar no arquivo.

### Estado atual (honesto — Dogma Zero) — atualizado em 2026-09-17

**Superado.** O servidor MCP real existe: `src/mcp/server.ts`
(`createUrionMcpServer`, via SDK `@modelcontextprotocol/sdk`) + `src/mcp/index.ts`
(boot com `StdioServerTransport`), com as tools `urion_security_check` e
`urion_explain_risk` registradas e retorno estruturado (status/score/findings). Foi
validado com o cliente MCP oficial via stdio — ver `docs/ide-setup.md`. A classe
antiga `UrionMcpGuardServer` (que este parágrafo descrevia como "stub") virou
código morto, referenciada só pelo próprio teste dela.

`VIBE_GUARD_RULES` também já tem fonte única em
`src/features/security-audit/domain/vibe-guard-rules.ts`, sincronizada para
`.cursor/rules` via `scripts/sync-vibe-guard-rules.ts`.

O gate de configuração (item 2 abaixo) também avançou: RLS ausente, rotas sem auth
e segredos/`.env` versionados já são detectados via CLI `urion-checks`
(`src/features/security-audit/presentation/checks-cli.ts`). O que falta é (a)
expandir para o ruleset R1–R10 completo e (b) ligar esse gate ao
`.husky/pre-commit` — hoje ele roda só sob demanda, não bloqueia commit
automaticamente. Detalhe por item em `docs/01-product/roadmap.md` (Fase 2).

### Visão do que o MCP guard deve enforçar (evolução, não só regex)

1. **Gate de geração (guardrails):** bloquear/avisar padrões inseguros na hora —
   secrets, auth no cliente, SQLi, XSS, e comandos destrutivos de IA. ✅ Entregue
   (advisory via MCP; sem bloqueio físico ainda).
2. **Gate de configuração (o que hoje falta e é onde os apps morrem):** checar
   RLS/permissões (Supabase/Firebase), endpoints sem auth, `.env` versionado.
   🟡 Detectores prontos via CLI; falta ligar ao pre-commit para virar bloqueio.
3. **Gate de spec:** a IA consulta a spec/os testes reais via MCP e para de
   alucinar; recusa gerar feature sem spec associada. ❌ Não iniciado (Fase 3.3).
4. **Gate de launch:** "pronto para o ar" só quando spec + testes + revisão passam.
   ❌ Não iniciado (Fase 3.4).

Sequência do núcleo, já percorrida até o passo (3): (1) MCP server real com tools
ponta a ponta no Cursor → (2) fonte única das regras → (3) gate de configuração
(RLS/auth/.env) como detector → próximo passo real é (3b) ligar esse gate ao
pre-commit, depois (4) gate de spec/launch.

---

## 6. Contra quem competimos e por que ganhamos

- **Scanners maduros (Snyk, Semgrep, GitGuardian):** superiores em detecção, mas
  falam "dev sênior", são reativos e não previnem na geração. Ganhamos em
  prevenção + idioma leigo + integração com o fluxo de IA.
- **Scanners de vibe coding (ex.: vibeappscanner.com):** concorrência direta e já
  existe. Diferenciação obrigatória: prevenção em tempo real + governança + foco em
  config (RLS/auth), não só varredura pós-fato.
- **GitHub Spec Kit / SDD:** valida a tese de "spec primeiro", mas é ferramenta de
  dev. Podemos ser o SDD _para quem não é dev_, embutido no editor.

---

## 7. Princípios inegociáveis (o que nos protege)

1. **Zero overclaim.** Toda alegação no README/CLI/site tem que ser verdadeira e
   verificável. Nada de comando `fix` que não existe, selo que dispensa revisão, ou
   estatística sem fonte. A confiança _é_ o produto.
2. **O selo nunca substitui a revisão** — ele _força_ a revisão.
3. **Prevenção antes de detecção** em toda decisão de roadmap.
4. **Fonte única de verdade** para regras e gates.

---

## 8. O que precisa ser verdade para vencermos (riscos)

- Um MCP guard real, conectável, que um maker instala em minutos. (✅ existe desde
  a Fase 1; falta confirmação de instalação por um usuário real fora do time)
- Cobrir a dor real (config/RLS/auth), não só regex. (🟡 detectores existem via CLI
  `urion-checks`; ainda não bloqueiam automaticamente no pre-commit)
- Falsos positivos baixos o bastante para não irritar. (risco do regex atual — ainda
  não medido com projetos reais de terceiros)
- Validação com usuários reais: um não-dev entende a saída e age? (não testado; 1
  star, 0 uso comprovado)

---

## 9. Norte de sucesso (métricas)

- Tempo do "instalar → primeiro gate útil disparado" < 5 min.
- % de gerações inseguras interceptadas antes do commit (prevenção real).
- Nº de makers que passam pelo gate de launch e não sofrem incidente conhecido.
- Adoção real (instalações ativas), não estrelas.

---

## 10. Honesty Check (Dogma Zero)

- **Testado em runtime?** A leitura de código e o stub do MCP foram verificados; a
  estratégia NÃO foi validada com usuários. As afirmações de mercado vêm de fontes
  web (nível MÉDIA-ALTA), com números que variam por estudo.
- **Suposições declaradas:** que o público-alvo valoriza prevenção em tempo real
  mais que um relatório pós-fato (plausível, não validado).
- **Nível de certeza:** ALTA sobre o estado do código; MÉDIA sobre a estratégia de
  mercado.
