// src/mcp/index.ts
// Entrypoint do binario `urion-mcp-server` (bundlado por esbuild em bin/urion-mcp-server.mjs).
// Sobe o servidor MCP no transporte stdio. stdout e reservado ao protocolo MCP;
// qualquer log humano vai para stderr.

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createUrionMcpServer } from './server';

async function main(): Promise<void> {
  const server = createUrionMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('🛡️  Urion VibeGuard MCP server ativo (stdio).\n');
}

main().catch((err: unknown) => {
  process.stderr.write(`Erro fatal no Urion MCP server: ${String(err)}\n`);
  process.exit(1);
});
