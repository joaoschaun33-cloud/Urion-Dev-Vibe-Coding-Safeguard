# Urion — Posicionamento & Estratégia

> Documento vivo. Autor: João Schaun (PO/Arquiteto) + Claude (dev sênior).
> Data-base: 2026-08-03. Nível de certeza global: MÉDIA (estratégia informada por
> pesquisa e leitura do código; não por validação com usuários reais ainda).

---

## 1. Tese central (uma frase)

**O Urion é o motor de governança que força o vibe coder a seguir, em tempo real,
o processo que separa os apps de IA que dão certo dos que vazam dados ou colapsam
— especificar antes de codar, gerar com guardrails, e não lançar sem revisão.**

Não somos um scanner. O scanner é *uma* feature. Somos a camada que impede o
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

Lição-mãe da pesquisa: *IA/low-code não remove complexidade, redistribui* — dá
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

**Mensagem central:** *"Urion — o profissional que revisa seu código de IA antes do
launch, em tempo real, na sua língua."*

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
os gates *antes* do código entrar no arquivo.

### Estado atual (honesto — Dogma Zero)

Hoje `src/mcp/urion-mcp-server.ts` é um **stub**: uma classe
(`UrionMcpGuardServer.checkCodeSafety/explainRisk`) que roda as mesmas 5 regex.
Não é um servidor MCP real (não há transporte stdio nem registro de tools via SDK
do MCP), então ainda **não** conecta de verdade no Cursor/Claude. A lógica existe;
o "servidor" não. Além disso, `VIBE_GUARD_RULES` está duplicada em 4 arquivos —
precisa virar fonte única antes de escalar.

### Visão do que o MCP guard deve enforçar (evolução, não só regex)

1. **Gate de geração (guardrails):** bloquear/avisar padrões inseguros na hora —
   secrets, auth no cliente, SQLi, XSS, e comandos destrutivos de IA.
2. **Gate de configuração (o que hoje falta e é onde os apps morrem):** checar
   RLS/permissões (Supabase/Firebase), endpoints sem auth, `.env` versionado.
3. **Gate de spec:** a IA consulta a spec/os testes reais via MCP e para de
   alucinar; recusa gerar feature sem spec associada.
4. **Gate de launch:** "pronto para o ar" só quando spec + testes + revisão passam.

Sequência sugerida do núcleo: (1) transformar o stub num MCP server real com 1–2
tools funcionando ponta a ponta no Cursor → (2) unificar as regras em fonte única →
(3) adicionar o gate de configuração (RLS/auth), que é o maior diferencial de dor
real → (4) gate de spec/launch.

---

## 6. Contra quem competimos e por que ganhamos

- **Scanners maduros (Snyk, Semgrep, GitGuardian):** superiores em detecção, mas
  falam "dev sênior", são reativos e não previnem na geração. Ganhamos em
  prevenção + idioma leigo + integração com o fluxo de IA.
- **Scanners de vibe coding (ex.: vibeappscanner.com):** concorrência direta e já
  existe. Diferenciação obrigatória: prevenção em tempo real + governança + foco em
  config (RLS/auth), não só varredura pós-fato.
- **GitHub Spec Kit / SDD:** valida a tese de "spec primeiro", mas é ferramenta de
  dev. Podemos ser o SDD *para quem não é dev*, embutido no editor.

---

## 7. Princípios inegociáveis (o que nos protege)

1. **Zero overclaim.** Toda alegação no README/CLI/site tem que ser verdadeira e
   verificável. Nada de comando `fix` que não existe, selo que dispensa revisão, ou
   estatística sem fonte. A confiança *é* o produto.
2. **O selo nunca substitui a revisão** — ele *força* a revisão.
3. **Prevenção antes de detecção** em toda decisão de roadmap.
4. **Fonte única de verdade** para regras e gates.

---

## 8. O que precisa ser verdade para vencermos (riscos)

- Um MCP guard real, conectável, que um maker instala em minutos. (hoje: não existe)
- Cobrir a dor real (config/RLS/auth), não só regex. (hoje: não cobre)
- Falsos positivos baixos o bastante para não irritar. (risco do regex atual)
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
