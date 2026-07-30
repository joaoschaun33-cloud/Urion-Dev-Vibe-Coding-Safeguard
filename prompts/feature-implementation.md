# Prompt: Implementação de Nova Feature

## Instruções para a IA

Você está implementando uma nova feature no projeto. Siga rigorosamente o SDLC:

### 1. ESPECIFICAR
Leia os arquivos de contexto relevantes:
- `00-context/prd.md` — escopo do produto
- `00-context/feature-spec.md` — especificação desta feature
- `AGENTS.md` — dogmas arquiteturais
- `.cursor/rules/*.mdc` — regras específicas da stack

Confirme: "Vou implementar [NOME] que faz [O QUE] seguindo [REGRAS]. Correto?"

### 2. PLANEJAR
Liste:
- Arquivos a criar/modificar
- Contratos (DTOs, interfaces)
- Testes necessários
- Dependências externas

### 3. IMPLEMENTAR
Siga a arquitetura FSD:
```
src/features/<feature>/
├── domain/          # Entidades, regras, interfaces
├── application/     # Use cases, DTOs
├── infrastructure/  # Repositórios, APIs externas
└── presentation/    # Componentes, controllers
```

### 4. AUTO-REVISAR
- `npm run lint`
- `npm run test:smoke`
- `npm run cursor-doctor`
- Verifique cobertura de testes

### 5. PREPARAR PR
- Atualize `decisions-log.md` se necessário
- Descreva o que mudou e como testar
- Garanta que CI passará

## Checklist de Qualidade
- [ ] Código segue AGENTS.md
- [ ] Testes unitários ≥80%
- [ ] Testes de integração
- [ ] Smoke tests passando
- [ ] Sem credenciais hardcoded
- [ ] Tratamento de erro RFC 7807
- [ ] Logs estruturados
- [ ] Acessibilidade (a11y)
