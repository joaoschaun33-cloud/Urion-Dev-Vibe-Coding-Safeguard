# User Stories — Vibe Coding Safeguard

> Histórias de usuário formatadas para orientar o desenvolvimento e o uso deste repositório.

---

## US-001: Clonar e Rodar com Segurança em 5 Minutos

**Como** Alex (Solopreneur Não-Técnico),  
**Quero** clonar este repositório e colocar a API rodando em 1 comando,  
**Para que** eu não perca dias configurando banco de dados, Docker e TypeScript antes de começar a vibe com a IA.

### Critérios de Aceite

- [x] Dado um repositório recém-clonado, quando o usuário roda `bash first-time.sh` ou `docker-compose up -d`, a API e o banco de dados sobem sem erros.
- [x] Dado a API rodando, o endpoint `GET /api/v1/health` responde status 200 OK.

---

## US-002: Verificação de Saúde em 1 Segundo

**Como** Alex (Solopreneur Não-Técnico),  
**Quero** rodar um comando simples de diagnóstico (`make check` ou `npm run cursor-doctor`),  
**Para que** eu saiba instantaneamente se a IA cometeu um erro ou quebrou meu projeto sem eu perceber.

### Critérios de Aceite

- [x] O comando executa em menos de 3 segundos.
- [x] Retorna relatório claro detalhando arquivos, regras MDC, testes e integrações.

---

## US-003: Geração de Nova Feature de Negócio sem Quebrar o Sistema

**Como** Rafa (Dev Júnior / Vibe Coder),  
**Quero** gerar o esqueleto de uma nova funcionalidade via CLI (`npm run generate:feature <nome>`),  
**Para que** a nova funcionalidade nasça isolada em Clean Architecture / FSD sem misturar código na camada global.

### Critérios de Aceite

- [x] Cria a pasta `src/features/<nome>` com as subpastas `domain`, `application`, `infrastructure`, `presentation` e `tests`.
- [x] Gera arquivos de exemplo funcionais com testes prontos para execução.

---

## US-004: Garantia de Honestidade Absoluta da IA

**Como** Alex (Solopreneur Não-Técnico),  
**Quero** que a IA admita quando não sabe algo ou quando o plano tem riscos,  
**Para que** eu não seja enganado por alucinações de código que fingem funcionar mas contêm falhas ocultas.

### Critérios de Aceite

- [x] A IA consulta `@AGENTS.md` e `.cursor/rules/honesty.mdc`.
- [x] A IA declara o nível de certeza antes de executar tarefas complexas.
