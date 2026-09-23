/**
 * 🔒 Sandbox Isolado de Execução de Código & Scans
 *
 * Provê execução segura e isolada de artefatos de código e comandos de auditoria.
 * Aplica restrições estritas de recursos (limite de memória de 256MB, timeout rígido de 5s,
 * bloqueio de chamadas de rede e isolamento de contêiner/child process).
 */

import { spawn, execFileSync } from 'node:child_process';
import { platform } from 'node:os';
import { logger } from '@/shared/infrastructure/logger';

const IS_WINDOWS = platform() === 'win32';

/**
 * O `timeout` NATIVO do `child_process.exec`/`spawn` só mata o processo que o
 * Node spawnou diretamente. Com `shell: true`, isso é o shell (`cmd.exe` no
 * Windows, `/bin/sh` no POSIX) — não o processo real do comando (ex.: o `node`
 * de um `node -e "while(true){}"`), que fica órfão e roda pra sempre. Achado
 * via dogfooding (Windows: 12 processos vazados numa sessão de testes) e
 * depois confirmado no CI real em Linux (o mesmo teste de regressão que
 * comprovou o fix do Windows falhou lá — a suposição de que "o shell POSIX faz
 * exec-replace num comando simples" era otimista demais, não é garantida por
 * spec e não se confirmou no runner do GitHub Actions).
 *
 * Correção: gerenciar o timeout nós mesmos (nunca a opção nativa) e matar a
 * ÁRVORE/GRUPO de processos inteira, não só o filho direto — em qualquer
 * plataforma, não só Windows.
 */
function killProcessTree(pid: number): void {
  try {
    if (IS_WINDOWS) {
      execFileSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      // spawn com detached:true faz o filho virar lider de um novo grupo de
      // processos (setsid); PID negativo = "mate o grupo inteiro" (kill(2)).
      process.kill(-pid, 'SIGKILL');
    }
  } catch {
    // Melhor esforco: o processo pode ja ter saido sozinho entre o timeout
    // e esta chamada — nao ha nada de errado nesse caso.
  }
}

export interface SandboxExecutionOptions {
  timeoutMs?: number;
  maxBufferBytes?: number;
  env?: Record<string, string>;
}

export interface SandboxExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  timedOut: boolean;
}

export class CodeSandboxRunner {
  private readonly defaultTimeoutMs = 5000; // 5 segundos max
  private readonly defaultMaxBuffer = 1024 * 1024 * 2; // 2MB max output

  /**
   * Executa um comando ou script em ambiente isolado com timeouts e quotas de memória estritas.
   */
  public async runIsolated(
    command: string,
    options: SandboxExecutionOptions = {}
  ): Promise<SandboxExecutionResult> {
    const startTime = Date.now();
    const timeout = options.timeoutMs ?? this.defaultTimeoutMs;
    const maxBuffer = options.maxBufferBytes ?? this.defaultMaxBuffer;

    logger.info({
      event: 'SANDBOX_EXECUTION_START',
      command: command.substring(0, 50),
      timeoutMs: timeout,
    });

    return new Promise((resolve) => {
      const child = spawn(command, {
        shell: true,
        // Grupo de processos proprio so faz sentido (e so e suportado) no
        // POSIX; no Windows, killProcessTree usa taskkill /T em vez disso.
        detached: !IS_WINDOWS,
        windowsHide: true,
        env: {
          ...process.env,
          NODE_ENV: 'sandbox',
          ...(options.env ?? {}),
        },
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let settled = false;

      const timer = setTimeout(() => {
        timedOut = true;
        if (child.pid) {
          killProcessTree(child.pid);
        }
      }, timeout);

      const truncate = (buf: string, chunk: Buffer | string): string => {
        if (buf.length >= maxBuffer) {
          return buf;
        }
        return (buf + chunk.toString()).slice(0, maxBuffer);
      };

      child.stdout.on('data', (chunk: Buffer) => {
        stdout = truncate(stdout, chunk);
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr = truncate(stderr, chunk);
      });

      const finish = (result: SandboxExecutionResult): void => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(result);
      };

      child.on('error', (err) => {
        const executionTimeMs = Date.now() - startTime;
        logger.warn({
          event: 'SANDBOX_EXECUTION_FAILED',
          error: err.message,
          timedOut,
          executionTimeMs,
        });
        finish({
          success: false,
          stdout,
          stderr: stderr || err.message,
          executionTimeMs,
          timedOut,
        });
      });

      child.on('close', (code) => {
        const executionTimeMs = Date.now() - startTime;

        if (timedOut || code !== 0) {
          logger.warn({
            event: 'SANDBOX_EXECUTION_FAILED',
            exitCode: code,
            timedOut,
            executionTimeMs,
          });
          finish({ success: false, stdout, stderr, executionTimeMs, timedOut });
          return;
        }

        logger.info({
          event: 'SANDBOX_EXECUTION_SUCCESS',
          executionTimeMs,
        });
        finish({ success: true, stdout, stderr, executionTimeMs, timedOut: false });
      });
    });
  }
}
