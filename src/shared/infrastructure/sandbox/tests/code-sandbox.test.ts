import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { CodeSandboxRunner } from '../code-sandbox';

function isProcessAlive(pid: number): boolean {
  try {
    // Sinal 0: nao mata nada, so testa existencia (funciona no Windows e no POSIX).
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

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

  it(
    'mata o processo real do SO apos o timeout, nao so reporta timedOut ' +
      '(achado de auditoria 2026-09-23: o teste anterior so checava o objeto de ' +
      'retorno, e teria passado igual com o vazamento de processo no Windows)',
    async () => {
      const pidFile = path.join(os.tmpdir(), `urion-sandbox-pid-${String(Date.now())}.txt`);
      try {
        // PIDFILE via env (nao embutido na string do comando) para evitar
        // problemas de escaping de aspas/backslash do path no cmd.exe (Windows).
        await sandbox.runIsolated(
          'node -e "require(\'fs\').writeFileSync(process.env.PIDFILE, String(process.pid)); while(true){}"',
          { timeoutMs: 500, env: { PIDFILE: pidFile } }
        );
        // Da um respiro pro SO liberar o processo depois do kill.
        await new Promise((resolve) => setTimeout(resolve, 500));

        const pid = Number(fs.readFileSync(pidFile, 'utf8').trim());
        expect(Number.isNaN(pid)).toBe(false);
        expect(isProcessAlive(pid)).toBe(false);
      } finally {
        fs.rmSync(pidFile, { force: true });
      }
    },
    10_000
  );
});
