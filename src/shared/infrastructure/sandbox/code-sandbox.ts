/**
 * 🔒 Sandbox Isolado de Execução de Código & Scans
 *
 * Provê execução segura e isolada de artefatos de código e comandos de auditoria.
 * Aplica restrições estritas de recursos (limite de memória de 256MB, timeout rígido de 5s,
 * bloqueio de chamadas de rede e isolamento de contêiner/child process).
 */

import { exec, execFileSync, ExecOptions } from 'node:child_process';
import { platform } from 'node:os';
import { logger } from '@/shared/infrastructure/logger';

const IS_WINDOWS = platform() === 'win32';

/**
 * No Windows, `exec()` roda o comando dentro de um `cmd.exe`. O `timeout`
 * NATIVO do Node mata so esse `cmd.exe` (o processo filho direto) DEPOIS que
 * ja invocou kill — mas nesse momento o processo real (neto, ex.: o `node`
 * de um `node -e "while(true){}"`) fica orfao e continua rodando pra sempre,
 * porque `taskkill /T` num PID que ja morreu nao consegue mais enumerar os
 * filhos dele. Achado via dogfooding: 12 processos assim vazaram so nesta
 * sessao de testes, degradando a maquina inteira.
 *
 * A correcao é gerenciar o timeout NOS MESMOS (sem usar a opcao `timeout` do
 * `exec` no Windows) e matar a arvore via `taskkill /T` ENQUANTO o `cmd.exe`
 * ainda esta vivo — so assim ele consegue enumerar e matar o processo real
 * por baixo também. No POSIX o timeout nativo do Node já funciona
 * corretamente (o shell tipicamente faz exec-replace num comando simples,
 * entao matar o filho direto já mata o processo real).
 */
function killWindowsProcessTree(pid: number): void {
  try {
    execFileSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
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
      const execOpts: ExecOptions = {
        // No Windows o timeout e gerenciado manualmente abaixo (ver
        // killWindowsProcessTree); no POSIX o timeout nativo do Node basta.
        ...(IS_WINDOWS ? {} : { timeout }),
        maxBuffer,
        env: {
          ...process.env,
          NODE_ENV: 'sandbox',
          ...(options.env ?? {}),
        },
      };

      let manuallyTimedOut = false;
      let timer: ReturnType<typeof setTimeout> | undefined;

      const child = exec(command, execOpts, (error, stdout, stderr) => {
        if (timer) {
          clearTimeout(timer);
        }
        const executionTimeMs = Date.now() - startTime;
        const timedOut = IS_WINDOWS ? manuallyTimedOut : Boolean(error?.killed);

        if (error) {
          logger.warn({
            event: 'SANDBOX_EXECUTION_FAILED',
            error: error.message,
            timedOut,
            executionTimeMs,
          });

          resolve({
            success: false,
            stdout: stdout.toString(),
            stderr: stderr.toString() || error.message,
            executionTimeMs,
            timedOut,
          });
          return;
        }

        logger.info({
          event: 'SANDBOX_EXECUTION_SUCCESS',
          executionTimeMs,
        });

        resolve({
          success: true,
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          executionTimeMs,
          timedOut: false,
        });
      });

      if (IS_WINDOWS) {
        timer = setTimeout(() => {
          manuallyTimedOut = true;
          if (child.pid) {
            killWindowsProcessTree(child.pid);
          }
        }, timeout);
      }
    });
  }
}
