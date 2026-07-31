# 🛡️ Política de Segurança — Urion Dev Vibe Coding Safeguard

## 1. Escopo de Proteção do Safeguard

O **Urion Safeguard** é o sistema operacional de governança que atua como **primeira linha de defesa** contra colapso arquitetural, vazamento de credenciais e alucinações de IA durante o desenvolvimento com assistentes (Cursor, Antigravity, Windsurf, Copilot).

### O que o Safeguard protege
- ✅ **Dogma Zero**: Bloqueia PRs se a IA alegar que "os testes passaram" sem gerar logs reais do Vitest.
- ✅ **Feature-Sliced Design (FSD)**: Linter estático que impede importações cruzadas entre features (`features/auth` ↔ `features/payment`).
- ✅ **Secrets & Credenciais**: Scanner AST que detecta API Keys, Tokens JWT e passwords hardcoded em `src/` em 1 segundo.
- ✅ **Limpeza de Produção**: Detecta `console.log()` residuais em código de produção.
- ✅ **Prompt Injection Passivo**: Tratamento estrito de arquivos Markdown (.md) como texto passivo para evitar execução de instruções maliciosas.

---

### ⚠️ O que o Safeguard NÃO substitui — LEIA COM ATENÇÃO

> **AVISO CRÍTICO DE ARQUITETURA:**  
> O Urion Safeguard garante a integridade estática, a arquitetura limpa e a honestidade da IA, mas **não substitui a validação de regras de negócio específicas da sua aplicação**.

| Vulnerabilidade de Negócio | Por que o Safeguard não pega sozinho | Como você / a IA devem implementar |
| :--- | :--- | :--- |
| **Manipulação de Preço no Front** (`price: req.body.price`) | O payload JSON é tecnicamente válido. O Safeguard não sabe que R$ 0,01 é incorreto. | Sempre busque e valide preços diretamente no banco de dados. |
| **Bypass de Autenticação / OTP** | A requisição pode estar sintaticamente correta. | Implemente middlewares de sessão obrigatórios nos use cases. |
| **IDOR** (Ex: `/api/user/123` alterado para `/124`) | A rota é válida, mas o usuário `124` não pertence à sessão ativa. | Implemente validação de propriedade (*ownership check*): `doc.userId === req.user.id`. |
| **Race Conditions** (Saques simultâneos) | Requisições parecem legítimas isoladamente. | Utilize transações no Prisma ou travas distribuídas via Redis. |

**Regra de Ouro:** O Urion Safeguard é o cinto de segurança e a estrutura do carro, mas a lógica de negócio do motor continua sob responsabilidade da especificação do produto.

---

## 2. Como Reportar uma Vulnerabilidade de Segurança

Encontrou uma falha no Urion Safeguard ou um bypass no Doctor AST? **NÃO abra uma issue pública.**

Envie um e-mail para: **`joaoschaun@gmail.com`** contendo:
1. **Descrição**: Qual regra foi burlada e como.
2. **PoC (Proof of Concept)**: Trecho de código ou script que reproduz o bypass.
3. **Impacto**: O que a IA ou um agente malicioso consegue fazer.
4. **Versão**: A versão exata do repositório/cli (`v1.0.0`).

- **SLA de Resposta**: 48h úteis.
- **Correção**: Publicada em até 7 dias com atualização no CHANGELOG.md e menção nos créditos de segurança.

---

## 3. Modelo de Ameaça (Threat Model)

Assumimos as seguintes premissas operacionais:
- **Agentes de IA Generativa**: IAs podem sugerir dependências vulneráveis, credenciais falsas ou ignorar testes para "finalizar a tarefa".
- **Prompt Injection via Documentação**: Documentos Markdown externos baixados da web podem tentar instruir a IA a exfiltrar arquivos `.env` ou rodar scripts de terminal.
- **Ambiente de Desenvolvimento Isolado**: O desenvolvedor opera com Docker e Node 20+, dependendo do `.env` local.

---

## 4. Checklist de Segurança para Pull Requests

Todo Pull Request enviado ao repositório deve validar os seguintes itens:
- [ ] O código segue `AGENTS.md` e o **Dogma Zero**.
- [ ] `npm run cursor-doctor` executou com **0 erros e 0 avisos**.
- [ ] `npm test` passou com **100% dos testes cobrindo novas rotas**.
- [ ] Não foram introduzidas credenciais hardcoded ou `console.log()` residuais.
- [ ] Nenhuma importação cruzada entre pastas de `features/` foi inserida.

