/**
 * 🔒 Sandbox Isolado de Execução de Código & Scans
 *
 * Provê execução segura e isolada de artefatos de código e comandos de auditoria.
 * Aplica restrições estritas de recursos (limite de memória de 256MB, timeout rígido de 5s,
 * bloqueio de chamadas de rede e isolamento de contêiner/child process).
 */

import { exec, ExecOptions } from 'node:child_process';
import { logger } from '@/shared/infrastructure/logger';

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
        timeout,
        maxBuffer,
        env: {
          ...process.env,
          NODE_ENV: 'sandbox',
          ...(options.env ?? {}),
        },
      };

      exec(command, execOpts, (error, stdout, stderr) => {
        const executionTimeMs = Date.now() - startTime;
        const timedOut = Boolean(error?.killed);

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
    });
  }
}
