# MCP — Model Context Protocol

> Configuração de servidores MCP para expandir as capacidades da IA além do código fonte.

## 🔌 Servidores Configurados

### 1. database-schema
- **Propósito**: Ler schemas, tabelas, índices e constraints do PostgreSQL.
- **Uso**: A IA pode consultar o schema atual antes de gerar migrations ou queries.
- **Config**: Edite a connection string em `mcp-config.json`.

### 2. filesystem
- **Propósito**: Navegar e ler arquivos do projeto.
- **Uso**: A IA acessa documentação, logs, e contexto adicional.

### 3. github
- **Propósito**: Interagir com issues, PRs, e releases do GitHub.
- **Uso**: A IA pode ler issues para entender bugs ou feature requests.
- **Requer**: `GITHUB_TOKEN` no `.env`.

### 4. command-runner
- **Propósito**: Executar comandos de terminal de forma controlada.
- **Uso**: Rodar `make test`, `npm run build`, etc.
- **Segurança**: Acesso limitado a comandos predefinidos.

## 🚀 Como Usar

1. Instale o servidor MCP desejado:
   ```bash
   npm install -g @modelcontextprotocol/server-postgres
   ```

2. Configure as variáveis de ambiente no `.env`:
   ```
   GITHUB_TOKEN=ghp_xxxxxxxx
   DATABASE_URL=postgresql://user:pass@localhost:5432/db
   ```

3. No Cursor ou outra IDE com MCP, aponte para `mcp-config.json`.

## ⚠️ Segurança
- NUNCA exponha tokens no repositório.
- Use `.env` e `.env.example`.
- Revise permissões de tokens regularmente.
