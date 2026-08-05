# Dogfooding — O Urion aplicado a si mesmo

> Evidência concreta de onde o produto entrega e onde ainda não entrega.
> Data-base: 2026-08-03. Execução real das ferramentas neste repositório.
> Nível de certeza: ALTA (rodei os comandos + auditei o código; sem suposição).

---

## Resumo em uma frase

O Urion hoje verifica **"os arquivos de governança estão presentes?"** — não
**"as promessas são verdadeiras e o código é de fato seguro?"**. **Presença ≠
enforcement.** Este repositório passou com nota máxima em todas as ferramentas do
Urion e, mesmo assim, contém falsa cobertura, comando fantasma, claim sem fonte e um
"MCP server" que não roda.

---

## O achado que resume tudo

O scanner técnico (`node bin/urion-safeguard.cjs scanner`) declarou:

```
📊 Status Geral: EXCELENTE (100% Auditado)
   Cobertura Estimada: 18%
🎉 Projeto 100% blindado! Pronto para Vibe Coding com IA.
```

Ele se dá **"100% blindado"** contando presença de arquivos de governança, e ignora
seu próprio número (**18%** de cobertura) que reprovaria pelo dogma de 80% do
projeto. Isso é um **falso verde** — exatamente o overclaim que o produto existe para
combater.

---

## O que o Urion PEGA neste repo (verificado)

| Item | Ferramenta | Resultado |
| --- | --- | --- |
| Presença de `.cursorrules`, `AGENTS.md`, 10 regras `.mdc`, snapshot | rules / scanner | ✅ detecta (10/10 válidas) |
| Arquitetura & stack (FSD, Express, Prisma, PostgreSQL, Vitest) | scanner | ✅ detecta correto |
| 5 vulns de código em forma literal (secrets, auth cliente, SQLi, XSS, rate-limit) | vibeguard / MCP stub | ✅ detecta se presentes (achou 0 aqui) |
| Número de cobertura estimada | scanner | ✅ exibe (18%) |

---

## O que o Urion DEIXA PASSAR (defeitos reais deste repo, não flagrados)

| Defeito real | Por que passou |
| --- | --- |
| Veredito "100% blindado" com 18% de cobertura | Gate conta presença, não reprova por métrica ruim |
| Comando `fix --rule=...` anunciado mas inexistente | Nada verifica se o que é prometido existe (Dogma Zero) |
| Claim "92%" sem fonte no README | Zero verificação de alegações/citações |
| `VIBE_GUARD_RULES` duplicada em 4 arquivos | Sem checagem de fonte única / DRY |
| "MCP server em tempo real" é um stub (classe, não servidor) | Nada valida se o anunciado funciona |
| Config de segurança real: RLS, auth, endpoints expostos | Não checa — e é o que derruba apps reais (Lovable/Base44/Tea) |
| Cobertura real / N+1 | Usa proxy `testFiles/codeFiles`; não roda coverage; não audita N+1 apesar do `AGENTS.md` proibir |

---

## Implicação para o roadmap

Os buracos acima definem os gates que faltam, em ordem de impacto na credibilidade:

1. **Gate de honestidade/consistência** (barato, alto impacto de marca): matar falso
   verde — reprovar quando o próprio número contradiz o veredito; verificar que todo
   comando/feature anunciado existe; exigir fonte para alegações no README/CLI.
2. **Gate de configuração** (RLS, auth, endpoints, `.env`) — a dor real dos apps.
3. **Coverage real** em vez de proxy; auditoria de N+1.
4. **Fonte única** para regras e gates.

Tudo isso deve convergir para o **MCP guard em tempo real** como veículo de entrega
(ver `docs/01-product/posicionamento-estrategia.md`, Seção 5).
