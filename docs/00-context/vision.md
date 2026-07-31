# Vision.md — Visão do Produto

## 🎯 Propósito

> **Garantir que criadores, empreendedores e desenvolvedores (especialmente não-técnicos) que utilizam Vibe Coding consigam transformar suas ideias em produtos digitais escaláveis e seguros, impedindo que seus sonhos virem frustração e fracasso por falta de arquitetura, testes e governança.**

---

## 👥 Público-Alvo

### 1. Primário: O Vibe Coder / Criador Não-Técnico (Solopreneur)

- Empreendedores com ótimas ideias que utilizam assistentes de IA (Cursor, Antigravity/Gemini, Windsurf, Copilot) para construir software.
- Têm pouca ou nenhuma bagagem em arquitetura de software, Clean Code, CI/CD ou testes automatizados.
- **Risco**: Seus projetos acumulam débito técnico rápido demais, colapsam quando ganham complexidade e viram um "monstro" impossível de manter.

### 2. Secundário: Desenvolvedor Júnior / Migrador de Carreira

- Programadores no início da jornada que usam IA para acelerar a escrita de código.
- Precisam de barreiras e padrões arquiteturais estritos para não aprender vices de código e gambiarras geradas por alucinações de IA.

### 3. Terciário: Mentores, Tech Leads e Product Owners

- Profissionais técnicos que orientam times e fundadores não-técnicos, necessitando de uma base padronizada e auditável.

---

## 🏆 Objetivos de Negócio

1. **Zero Colapso Arquitetural**: Garantir que a base de código permaneça legível, testada e modular mesmo após 100+ iterações puramente geradas por IA.
2. **Redução de Frustração e Descarte**: Evitar o abandono de projetos por causa de erros enigmáticos ou regressões silenciosas introduzidas pela IA.
3. **Validação Instantânea de Saúde**: Fornecer ferramentas de diagnóstico de 1 clique (ex: `make check`, `npm run cursor-doctor`) para que qualquer pessoa entenda a saúde do projeto em 5 segundos.

---

## 🚫 Fora de Escopo (Anti-Visão)

- **NÃO é um curso teórico sobre código**: É uma ferramenta prática executável.
- **NÃO é uma biblioteca de componentes UI puramente visual**: É um template estrutural e arquitetural de backend/fullstack focado em robustez.
- **NÃO incentiva o "Vibe Coding Caótico"**: Rejeita gerações sem plano, sem especificação prévia ou sem cobertura de testes.

---

## 📐 Restrições

- **Compatibilidade com qualquer assistente de IA**: Deve funcionar de forma igual via protocolo MDC (`.cursor/rules`), `AGENTS.md` e prompts reutilizáveis.
- **Leve e Rápido**: O ambiente deve rodar localmente sem exigir infraestruturas complexas além do Docker.
- **Cobertura Mínima**: Exigência de 80% de cobertura de testes em novos arquivos.

---

## 🔗 Contexto para IA

> Quando a IA for implementar novas funcionalidades neste projeto, ela DEVE proteger o usuário de decisões obscuras ou gambiarras. Se uma solução simples violar a arquitetura FSD ou os testes, a IA DEVE alertar o usuário e sugerir o caminho arquitetural correto.
