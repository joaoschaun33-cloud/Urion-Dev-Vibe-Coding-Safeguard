import { describe, it, expect } from 'vitest';
import { CodeSandboxRunner } from '../code-sandbox';

describe('CodeSandboxRunner', () => {
  const sandbox = new CodeSandboxRunner();

  it('deve executar comandos seguros dentro do limite de tempo', async () => {
    const result = await sandbox.runIsolated('node -e "console.log(\'sandbox ok\')"');

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('sandbox ok');
    expect(result.timedOut).toBe(false);
  });

  it('deve interromper comandos que excedem o timeout limite', async () => {
    const result = await sandbox.runIsolated('node -e "while(true){}"', { timeoutMs: 500 });

    expect(result.success).toBe(false);
    expect(result.timedOut).toBe(true);
  });
});
